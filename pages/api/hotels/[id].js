import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const hotel = await prisma.hotel.findUnique({
          where: { id },
          include: {
            rooms: true,
            packages: true,
            facilities: true,
            notice: true,
            cancellationPolicy: true,
            bookingConfirmation: true,
          },
        });
        if (!hotel) {
          return res.status(404).json({ success: false, error: 'Hotel not found' });
        }
        res.status(200).json({ success: true, hotel });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const updatedHotel = await prisma.hotel.update({
          where: { id: id },
          data: req.body,
        });
        res.status(200).json({ success: true, hotel: updatedHotel });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        if (!id) {
          return res.status(400).json({ success: false, error: 'Template ID is required' });
        }
        await prisma.$transaction(async (tx) => {
          await tx.room.deleteMany({ where: { hotelId: id } });
          await tx.package.deleteMany({ where: { hotelId: id } });
          await tx.facility.deleteMany({ where: { hotelId: id } });
          await tx.notice.deleteMany({ where: { hotelId: id } });
          await tx.cancellationPolicy.deleteMany({ where: { hotelId: id } });
          await tx.bookingConfirmation.deleteMany({ where: { hotelId: id } });
          await tx.hotel.delete({ where: { id } });
        });
        res.status(200).json({ success: true, message: 'Template deleted successfully' });
      } catch (error) {
        if (error.code === 'P2025') {
          return res.status(404).json({ success: false, error: 'Hotel not found or already deleted.' });
        }
        res.status(500).json({ success: false, error: `Failed to delete template: ${error.message}` });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
} 