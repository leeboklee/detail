'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardBody, CardHeader, Button, Progress, Chip, Divider, Spinner } from "@heroui/react";
import { useWebWorker } from '@/hooks/usePerformance';

export const PriceAnalytics = ({ pricingData }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [workerResult, setWorkerResult] = useState(null);

  // Web Worker 사용
  const { result, isWorking, error, postMessage } = useWebWorker('/workers/priceCalculator.js');

  // 분석 데이터 생성
  useEffect(() => {
    if (pricingData && Object.keys(pricingData).length > 0) {
      generateAnalytics();
    }
  }, [pricingData]);

  // Web Worker 결과 처리
  useEffect(() => {
    if (result) {
      setWorkerResult(result);
      setIsLoading(false);
    }
  }, [result]);

  const generateAnalytics = async () => {
    setIsLoading(true);
    
    try {
      // Web Worker로 무거운 계산 수행
      postMessage({
        type: 'GENERATE_PRICE_REPORT',
        data: pricingData
      });
      
      // 로컬에서도 기본 분석 수행
      const basicAnalytics = generateBasicAnalytics(pricingData);
      setAnalyticsData(basicAnalytics);
    } catch (error) {
      console.error('분석 생성 실패:', error);
    }
  };

  // 기본 분석 (로컬에서 수행)
  const generateBasicAnalytics = (data) => {
    if (!data?.priceTable?.roomTypes) return null;

    const analytics = {
      totalRoomTypes: data.priceTable.roomTypes.length,
      totalPriceTypes: 0,
      priceDistribution: {},
      roomTypeStats: {},
      generatedAt: new Date().toISOString()
    };

    let totalPrices = 0;
    let priceCount = 0;

    data.priceTable.roomTypes.forEach(roomType => {
      analytics.roomTypeStats[roomType.name] = {
        typeCount: roomType.types?.length || 0,
        totalPrice: 0,
        averagePrice: 0
      };

      if (roomType.types) {
        analytics.totalPriceTypes += roomType.types.length;

        roomType.types.forEach(type => {
          let typeTotal = 0;
          let typePriceCount = 0;

          if (type.prices) {
            Object.values(type.prices).forEach(periodPrices => {
              if (typeof periodPrices === 'object') {
                Object.values(periodPrices).forEach(price => {
                  if (typeof price === 'number' && price > 0) {
                    typeTotal += price;
                    totalPrices += price;
                    priceCount++;

                    // 가격 분포 카테고리화
                    const priceRange = getPriceRange(price);
                    analytics.priceDistribution[priceRange] = (analytics.priceDistribution[priceRange] || 0) + 1;
                  }
                });
              }
            });
          }

          analytics.roomTypeStats[roomType.name].totalPrice += typeTotal;
          analytics.roomTypeStats[roomType.name].averagePrice = typePriceCount > 0 ? typeTotal / typePriceCount : 0;
        });

        analytics.roomTypeStats[roomType.name].averagePrice = Math.round(analytics.roomTypeStats[roomType.name].averagePrice);
        analytics.roomTypeStats[roomType.name].totalPrice = Math.round(analytics.roomTypeStats[roomType.name].totalPrice);
      }
    });

    analytics.averagePrice = priceCount > 0 ? Math.round(totalPrices / priceCount) : 0;
    analytics.totalPrices = totalPrices;

    return analytics;
  };

  // 가격 범위 분류
  const getPriceRange = (price) => {
    if (price < 20000) return '20,000원 미만';
    if (price < 50000) return '20,000원 - 50,000원';
    if (price < 100000) return '50,000원 - 100,000원';
    if (price < 200000) return '100,000원 - 200,000원';
    return '200,000원 이상';
  };

  // 가격 분포 차트 데이터
  const chartData = useMemo(() => {
    if (!analyticsData?.priceDistribution) return [];

    return Object.entries(analyticsData.priceDistribution).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / analyticsData.totalPriceTypes) * 100)
    }));
  }, [analyticsData]);

  // 성능 최적화를 위한 메모이제이션
  const roomTypeList = useMemo(() => {
    if (!analyticsData?.roomTypeStats) return [];
    
    return Object.entries(analyticsData.roomTypeStats).map(([name, stats]) => ({
      name,
      ...stats
    }));
  }, [analyticsData]);

  if (!pricingData || Object.keys(pricingData).length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-500">분석할 요금 데이터가 없습니다.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">📊 요금 분석 대시보드</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onPress={generateAnalytics}
              isLoading={isLoading}
            >
              분석 새로고침
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 탭 네비게이션 */}
      <Card>
        <CardBody className="p-0">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'overview', label: '개요', icon: '📈' },
              { key: 'distribution', label: '가격 분포', icon: '📊' },
              { key: 'roomTypes', label: '객실 타입별', icon: '🏠' },
              { key: 'worker', label: '고급 분석', icon: '⚡' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 개요 탭 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData?.totalRoomTypes || 0}
              </div>
              <div className="text-sm text-gray-600">총 객실 타입</div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData?.totalPriceTypes || 0}
              </div>
              <div className="text-sm text-gray-600">총 가격 타입</div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData?.averagePrice?.toLocaleString() || 0}원
              </div>
              <div className="text-sm text-gray-600">평균 가격</div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analyticsData?.totalPrices?.toLocaleString() || 0}원
              </div>
              <div className="text-sm text-gray-600">총 가격 합계</div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 가격 분포 탭 */}
      {activeTab === 'distribution' && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-semibold">가격 분포 분석</h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.range}</span>
                    <span className="text-sm text-gray-600">
                      {item.count}개 ({item.percentage}%)
                    </span>
                  </div>
                  <Progress
                    value={item.percentage}
                    color="primary"
                    size="sm"
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* 객실 타입별 탭 */}
      {activeTab === 'roomTypes' && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-semibold">객실 타입별 통계</h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {roomTypeList.map((roomType, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-semibold">{roomType.name}</h5>
                    <Chip size="sm" color="primary" variant="flat">
                      {roomType.typeCount}개 타입
                    </Chip>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">총 가격:</span>
                      <span className="ml-2 font-medium">
                        {roomType.totalPrice.toLocaleString()}원
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">평균 가격:</span>
                      <span className="ml-2 font-medium">
                        {roomType.averagePrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Web Worker 분석 탭 */}
      {activeTab === 'worker' && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-semibold">고급 분석 (Web Worker)</h4>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="text-center py-8">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">고급 분석을 수행하고 있습니다...</p>
              </div>
            ) : workerResult ? (
              <div className="space-y-6">
                {/* 요약 정보 */}
                {workerResult.summary && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-3">📋 분석 요약</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">총 객실 타입:</span>
                        <div className="font-medium">{workerResult.summary.totalRoomTypes}개</div>
                      </div>
                      <div>
                        <span className="text-blue-600">총 가격 타입:</span>
                        <div className="font-medium">{workerResult.summary.totalPriceTypes}개</div>
                      </div>
                      <div>
                        <span className="text-blue-600">평균 가격:</span>
                        <div className="font-medium">{workerResult.summary.averagePrice?.toLocaleString()}원</div>
                      </div>
                      <div>
                        <span className="text-blue-600">가격 범위:</span>
                        <div className="font-medium">
                          {workerResult.summary.priceRange?.min?.toLocaleString()}원 ~ {workerResult.summary.priceRange?.max?.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 권장사항 */}
                {workerResult.recommendations && workerResult.recommendations.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-3">💡 권장사항</h5>
                    <ul className="space-y-2">
                      {workerResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-green-700 flex items-start">
                          <span className="mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 상세 정보 */}
                {workerResult.details && workerResult.details.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-3">📊 상세 분석</h5>
                    <div className="space-y-3">
                      {workerResult.details.map((detail, index) => (
                        <div key={index} className="border-l-4 border-blue-400 pl-4">
                          <h6 className="font-medium">{detail.name}</h6>
                          <div className="text-sm text-gray-600 mt-1">
                            총 가격: {detail.totalPrice?.toLocaleString()}원
                          </div>
                          {detail.types && detail.types.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {detail.types.map((type, typeIndex) => (
                                <div key={typeIndex} className="text-xs text-gray-500 ml-4">
                                  {type.name}: {type.totalPrice?.toLocaleString()}원
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 생성 시간 */}
                <div className="text-xs text-gray-500 text-center">
                  분석 생성: {new Date(workerResult.generatedAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">고급 분석을 시작하려면 "분석 새로고침" 버튼을 클릭하세요.</p>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 p-4 rounded-lg">
                <p className="text-red-700 text-sm">분석 중 오류가 발생했습니다: {error.message}</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">분석을 수행하고 있습니다...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAnalytics;
