'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Badge,
  Tooltip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@heroui/react'

// 기본 취소규정 템플릿 (이미지 기반)
const DEFAULT_CANCEL_TEMPLATES = [
  {
    id: 'hantour-cancel-policy',
    name: '한투어 취소환불 규정',
    data: {
      inquiryMethods: {
        workingDays: '월~금요일 10:00~17:00 (점심시간 12:00~13:00)',
        saturday: '토요일 13:00~16:00 (전화/카톡 문의 및 환불 신청 불가, 취소 수수료 적용)',
        holidays: '일요일, 공휴일, 임시공휴일, 대체공휴일, 회사 지정 휴무일',
        hantourPhone: '070-8979-9985',
        kakaoTalk: '카톡에서 "한투어(@hantour)" 검색하여 상담'
      },
      cancellationPolicy: {
        specialRegulations: '변경/취소/환불 위약금 특별규정',
        description: '본 상품 여행계약의 취소 위약금 규정(여행사 인건비 및 운영비 포함)은 \'한투어 특별약관\'을 따릅니다. 본 특별약관은 예약 숙박시설 규정과는 별도로 적용됩니다. 본 상품의 취소/변경 신청은 숙박 프론트에서는 불가하며, \'한투어\'를 통해서만 신청 가능합니다.',
        specificRules: [
          '위약금은 체크인 날짜 기준으로 계산됩니다. (토요일, 일요일, 공휴일, 휴무일 포함)',
          '근무일 17:00 이후 또는 토요일, 공휴일, 휴무일에 접수된 신청은 다음 근무일 날짜 기준으로 취소 기간이 계산됩니다. (예: 금요일 17:00 이후 접수 시 월요일 기준으로 계산)',
          '취소/변경 신청은 근무일 17:00까지 한투어 상담사에게 전화 또는 카톡으로 제출해야 합니다.',
          '취소/변경 위약금은 쿠폰이나 카드 할인 전 초기 판매가 기준으로 적용됩니다.',
          '위약금 환불은 초기 입금 후 쇼핑몰 결제 금액 기준으로 환불됩니다.',
          '신용카드 결제 취소는 카드사 사정에 따라 약 1~5일 정도 소요될 수 있습니다.'
        ]
      },
      lowSeasonPolicy: {
        title: '비수기규정',
        table: [
          { daysBefore: '8일전', penalty: '무료취소', percentage: '0%' },
          { daysBefore: '7일전', penalty: '20% 위약금', percentage: '20%' },
          { daysBefore: '6일전', penalty: '30% 위약금', percentage: '30%' },
          { daysBefore: '5일전', penalty: '40% 위약금', percentage: '40%' },
          { daysBefore: '4일전', penalty: '50% 위약금', percentage: '50%' },
          { daysBefore: '3일~당일(미이용)', penalty: '100% 위약금', percentage: '100%' }
        ]
      },
      peakSeasonPolicy: {
        title: '성수기/연휴/특별기간 규정',
        description: '성수기, 연휴, 특별기간에는 별도 규정이 적용됩니다.'
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const CancelPolicy = ({ value = { cancelPolicies: [] }, onChange, displayMode = false }) => {
  const [policies, setPolicies] = useState(value.cancelPolicies || [])
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isTemplateListOpen, setIsTemplateListOpen] = useState(false)
  const [templateList, setTemplateList] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cancellationFee: '',
    refundPercentage: '',
    noticePeriod: '',
    policyType: ''
  })

  // 초기 데이터 설정
  useEffect(() => {
    if (value?.cancelPolicies && JSON.stringify(value.cancelPolicies) !== JSON.stringify(policies)) {
      setPolicies(value.cancelPolicies)
    } else if (!value?.cancelPolicies || value.cancelPolicies.length === 0) {
      // 기본 템플릿 로드
      loadDefaultTemplates();
    }
  }, [value?.cancelPolicies, policies])

  // 기본 템플릿 로드
  const loadDefaultTemplates = useCallback(() => {
    try {
      // 로컬 스토리지에서 기본 템플릿 확인
      const savedTemplates = JSON.parse(localStorage.getItem('cancelPolicyTemplates') || '[]');
      
      if (savedTemplates.length === 0) {
        // 기본 템플릿이 없으면 기본값으로 설정
        localStorage.setItem('cancelPolicyTemplates', JSON.stringify(DEFAULT_CANCEL_TEMPLATES));
        setTemplateList(DEFAULT_CANCEL_TEMPLATES);
        
        // 첫 번째 기본 템플릿을 취소규정으로 로드
        if (DEFAULT_CANCEL_TEMPLATES.length > 0) {
          const defaultData = DEFAULT_CANCEL_TEMPLATES[0].data;
          const defaultPolicies = [
            {
              id: 'default-policy',
              name: '한투어 취소환불 규정',
              description: JSON.stringify(defaultData, null, 2),
              cancellationFee: '변동',
              refundPercentage: '0~100%',
              noticePeriod: '8일전~당일',
              policyType: '특별약관',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          setPolicies(defaultPolicies);
          if (onChange) {
            onChange({
              ...value,
              cancelPolicies: defaultPolicies
            });
          }
        }
      } else {
        setTemplateList(savedTemplates);
      }
    } catch (error) {
      console.error('기본 템플릿 로드 오류:', error);
    }
  }, [onChange, value]);

  // 템플릿 저장
  const saveTemplate = useCallback(() => {
    try {
      const templateName = prompt('템플릿 이름을 입력하세요:');
      if (!templateName) return;

      const existingTemplates = JSON.parse(localStorage.getItem('cancelPolicyTemplates') || '[]');
      const newTemplate = {
        id: Date.now().toString(),
        name: templateName.trim(),
        data: {
          policies: policies,
          createdAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedTemplates = [...existingTemplates, newTemplate];
      localStorage.setItem('cancelPolicyTemplates', JSON.stringify(updatedTemplates));
      
      setTemplateList(updatedTemplates);
      alert('템플릿이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('템플릿 저장 오류:', error);
      alert('템플릿 저장에 실패했습니다: ' + error.message);
    }
  }, [policies]);

  // 템플릿 목록 가져오기
  const fetchTemplateList = useCallback(() => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('cancelPolicyTemplates') || '[]');
      setTemplateList(savedTemplates);
      setIsTemplateListOpen(true);
    } catch (error) {
      console.error('템플릿 목록 불러오기 오류:', error);
      alert('템플릿 목록을 불러올 수 없습니다: ' + error.message);
    }
  }, []);

  // 템플릿 불러오기
  const loadSelectedTemplate = useCallback((template) => {
    if (template.data?.policies) {
      setPolicies(template.data.policies);
      if (onChange) {
        onChange({
          ...value,
          cancelPolicies: template.data.policies
        });
      }
    }
    setIsTemplateListOpen(false);
    alert('템플릿을 성공적으로 불러왔습니다.');
  }, [onChange, value]);

  const handleAddPolicy = () => {
    if (!formData.name || !formData.description) {
      alert('정책명과 설명을 입력해주세요.')
      return
    }

    const newPolicy = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedPolicies = [...policies, newPolicy]
    setPolicies(updatedPolicies)
    if (onChange) {
      onChange({
        ...value,
        cancelPolicies: updatedPolicies
      })
    }
    
    setFormData({
      name: '',
      description: '',
      cancellationFee: '',
      refundPercentage: '',
      noticePeriod: '',
      policyType: ''
    })
    setIsAdding(false)
    
    alert('새로운 취소 정책이 추가되었습니다.')
  }

  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy)
    setFormData({
      name: policy.name,
      description: policy.description,
      cancellationFee: policy.cancellationFee,
      refundPercentage: policy.refundPercentage,
      noticePeriod: policy.noticePeriod,
      policyType: policy.policyType || ''
    })
  }

  const handleUpdatePolicy = () => {
    if (!formData.name || !formData.description) {
      alert('정책명과 설명을 입력해주세요.')
      return
    }

    const updatedPolicies = policies.map(policy => 
      policy.id === editingPolicy.id 
        ? { ...policy, ...formData, updatedAt: new Date().toISOString() }
        : policy
    )
    
    setPolicies(updatedPolicies)
    if (onChange) {
      onChange({
        ...value,
        cancelPolicies: updatedPolicies
      })
    }
    
    setEditingPolicy(null)
    setFormData({
      name: '',
      description: '',
      cancellationFee: '',
      refundPercentage: '',
      noticePeriod: '',
      policyType: ''
    })
    
    alert('취소 정책이 수정되었습니다.')
  }

  const handleDeletePolicy = (policyId) => {
    if (confirm('정말로 이 정책을 삭제하시겠습니까?')) {
      const updatedPolicies = policies.filter(policy => policy.id !== policyId)
      setPolicies(updatedPolicies)
      if (onChange) {
        onChange({
          ...value,
          cancelPolicies: updatedPolicies
        })
      }
      
      if (editingPolicy && editingPolicy.id === policyId) {
        setEditingPolicy(null)
        setFormData({
          name: '',
          description: '',
          cancellationFee: '',
          refundPercentage: '',
          noticePeriod: '',
          policyType: 'standard'
        })
      }
      
      alert('취소 정책이 삭제되었습니다.')
    }
  }

  const cancelEdit = () => {
    setEditingPolicy(null)
    setFormData({
      name: '',
      description: '',
      cancellationFee: '',
      refundPercentage: '',
      noticePeriod: '',
      policyType: ''
    })
  }

  const getPolicyTypeColor = (type) => {
    switch (type) {
      case 'standard': return 'default'
      case 'flexible': return 'success'
      case 'strict': return 'warning'
      case 'premium': return 'secondary'
      default: return 'default'
    }
  }

  const getPolicyTypeLabel = (type) => {
    switch (type) {
      case 'standard': return '표준'
      case 'flexible': return '유연'
      case 'strict': return '엄격'
      case 'premium': return '프리미엄'
      default: return '기타'
    }
  }

  if (displayMode) {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">취소규정</h2>
        {policies && policies.length > 0 ? (
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{policy.name}</h3>
                    <Badge color={getPolicyTypeColor(policy.policyType)} variant="flat" className="ml-2">
                      {getPolicyTypeLabel(policy.policyType)}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{policy.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {policy.cancellationFee && (
                    <div>
                      <span className="font-medium text-gray-700">취소 수수료:</span>
                      <p className="text-gray-600">{policy.cancellationFee}</p>
                    </div>
                  )}
                  {policy.refundPercentage && (
                    <div>
                      <span className="font-medium text-gray-700">환불 비율:</span>
                      <p className="text-gray-600">{policy.refundPercentage}%</p>
                    </div>
                  )}
                  {policy.noticePeriod && (
                    <div>
                      <span className="font-medium text-gray-700">사전 통보:</span>
                      <p className="text-gray-600">{policy.noticePeriod}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>등록된 취소 정책이 없습니다.</p>
            <p className="text-sm mt-1">취소 정책을 입력하면 여기에 미리보기가 표시됩니다.</p>
          </div>
        )}
      </div>
    )
  }

  // 간편 저장/불러오기 (로컬스토리지)
  const handleBackupSave = () => {
    try {
      localStorage.setItem('cancelPoliciesBackup', JSON.stringify(policies || []))
      alert('취소정책이 로컬에 저장되었습니다.')
    } catch (e) {
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleBackupLoad = () => {
    try {
      const raw = localStorage.getItem('cancelPoliciesBackup')
      if (!raw) {
        alert('저장된 취소정책이 없습니다.')
        return
      }
      const loaded = JSON.parse(raw)
      if (!Array.isArray(loaded)) {
        alert('백업 데이터 형식이 올바르지 않습니다.')
        return
      }
      setPolicies(loaded)
      if (onChange) {
        onChange(prev => ({ ...prev, cancelPolicies: loaded }))
      }
      alert('취소정책이 불러와졌습니다.')
    } catch (e) {
      alert('불러오기 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">취소 정책 관리</h1>
            <p className="text-gray-600">호텔의 예약 취소 정책을 설정하고 관리할 수 있습니다.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              color="success" 
              variant="bordered"
              onPress={() => {
                if (onChange) {
                  onChange({
                    ...value,
                    cancelPolicies: policies
                  });
                }
                alert('취소규정이 미리보기에 생성되었습니다.');
              }}
              startContent="✨"
            >
              생성
            </Button>
            <Button 
              size="sm" 
              color="success" 
              variant="bordered"
              onPress={() => {
                if (DEFAULT_CANCEL_TEMPLATES.length > 0) {
                  const defaultTemplate = DEFAULT_CANCEL_TEMPLATES[0];
                  const defaultPolicies = [
                    {
                      id: 'default-policy',
                      name: '한투어 취소환불 규정',
                      description: JSON.stringify(defaultTemplate.data, null, 2),
                      cancellationFee: '변동',
                      refundPercentage: '0~100%',
                      noticePeriod: '8일~당일',
                      policyType: '특별약관',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    }
                  ];
                  setPolicies(defaultPolicies);
                  if (onChange) {
                    onChange({
                      ...value,
                      cancelPolicies: defaultPolicies
                    });
                  }
                  alert('기본 템플릿을 불러왔습니다.');
                }
              }}
            >
              기본 템플릿 불러오기
            </Button>
            <Button size="sm" color="secondary" variant="bordered" onPress={saveTemplate}>템플릿 저장</Button>
            <Button size="sm" color="primary" variant="bordered" onPress={fetchTemplateList}>템플릿 목록</Button>
            <Button size="sm" variant="flat" onPress={handleBackupSave}>저장</Button>
            <Button size="sm" variant="flat" onPress={handleBackupLoad}>불러오기</Button>
          </div>
        </div>
      </div>

      {/* 취소 정책 가이드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5 flex-shrink-0">
            i
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">취소 정책 가이드</h3>
            <p className="text-blue-800">
              고객이 예약을 취소할 때 적용되는 수수료, 환불 비율, 사전 통보 기간 등을 설정하세요.
            </p>
          </div>
        </div>
      </div>

      {/* 정책 추가 폼 */}
      {isAdding && (
        <Card className="w-full">
          <CardHeader>
            <h3 className="text-xl font-semibold">새 취소 정책 추가</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <Input
                  label="정책명*"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 표준 취소 정책"
                  className="w-full"
                />
                <Select
                  label="정책 유형"
                  selectedKeys={[formData.policyType]}
                  onSelectionChange={(keys) => setFormData({ ...formData, policyType: Array.from(keys)[0] })}
                  className="w-full"
                >
                  <SelectItem key="standard">표준</SelectItem>
                  <SelectItem key="flexible">유연</SelectItem>
                  <SelectItem key="strict">엄격</SelectItem>
                  <SelectItem key="premium">프리미엄</SelectItem>
                </Select>
              </div>

              <Textarea
                label="정책 설명*"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="취소 정책에 대한 상세한 설명을 입력하세요"
                minRows={3}
                className="w-full"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <Input
                  label="취소 수수료"
                  value={formData.cancellationFee}
                  onChange={(e) => setFormData({ ...formData, cancellationFee: e.target.value })}
                  placeholder="예: 10,000원"
                  description="취소 시 부과되는 수수료"
                  className="w-full"
                />
                <Input
                  label="환불 비율 (%)"
                  value={formData.refundPercentage}
                  onChange={(e) => setFormData({ ...formData, refundPercentage: e.target.value })}
                  placeholder="예: 90"
                  type="number"
                  min={0}
                  max={100}
                  description="환불되는 금액의 비율"
                  className="w-full"
                />
                <Input
                  label="사전 통보 기간"
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                  placeholder="예: 24시간 전"
                  description="취소 시 필요한 사전 통보 기간"
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">
                <Button color="primary" onPress={handleAddPolicy}>
                  ✓ 정책 추가
                </Button>
                <Button variant="light" onPress={() => setIsAdding(false)}>
                  ✕ 취소
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* 정책 수정 폼 */}
      {editingPolicy && (
        <Card className="w-full">
          <CardHeader>
            <h3 className="text-xl font-semibold">취소 정책 수정</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <Input
                  label="정책명*"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 표준 취소 정책"
                  className="w-full"
                />
                <Select
                  label="정책 유형"
                  selectedKeys={[formData.policyType]}
                  onSelectionChange={(keys) => setFormData({ ...formData, policyType: Array.from(keys)[0] })}
                  className="w-full"
                >
                  <SelectItem key="standard">표준</SelectItem>
                  <SelectItem key="flexible">유연</SelectItem>
                  <SelectItem key="strict">엄격</SelectItem>
                  <SelectItem key="premium">프리미엄</SelectItem>
                </Select>
              </div>

              <Textarea
                label="정책 설명*"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="취소 정책에 대한 상세한 설명을 입력하세요"
                minRows={3}
                className="w-full"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <Input
                  label="취소 수수료"
                  value={formData.cancellationFee}
                  onChange={(e) => setFormData({ ...formData, cancellationFee: e.target.value })}
                  placeholder="예: 10,000원"
                  description="취소 시 부과되는 수수료"
                  className="w-full"
                />
                <Input
                  label="환불 비율 (%)"
                  value={formData.refundPercentage}
                  onChange={(e) => setFormData({ ...formData, refundPercentage: e.target.value })}
                  placeholder="예: 90"
                  type="number"
                  min={0}
                  max={100}
                  description="환불되는 금액의 비율"
                  className="w-full"
                />
                <Input
                  label="사전 통보 기간"
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                  placeholder="예: 24시간 전"
                  description="취소 시 필요한 사전 통보 기간"
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">
                <Button color="primary" onPress={handleUpdatePolicy}>
                  ✓ 정책 수정
                </Button>
                <Button variant="light" onPress={cancelEdit}>
                  ✕ 취소
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* 정책 목록 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">등록된 취소 정책</h3>
          {!isAdding && !editingPolicy && (
            <Button
              color="primary"
              onPress={() => setIsAdding(true)}
            >
              + 새 정책 추가
            </Button>
          )}
        </div>

        {policies.length === 0 ? (
          <Card className="w-full">
            <CardBody className="text-center py-10">
              <p className="text-gray-500 text-lg">
                등록된 취소 정책이 없습니다.
              </p>
              <p className="text-gray-400 mt-2">
                첫 번째 취소 정책을 추가해보세요.
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => (
              <Card key={policy.id} className="w-full">
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold">{policy.name}</h4>
                        <Badge color={getPolicyTypeColor(policy.policyType)} variant="flat">
                          {getPolicyTypeLabel(policy.policyType)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Tooltip content="정책 수정">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleEditPolicy(policy)}
                            isDisabled={!!editingPolicy}
                          >
                            ✏️
                          </Button>
                        </Tooltip>
                        <Tooltip content="정책 삭제">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleDeletePolicy(policy.id)}
                            isDisabled={!!editingPolicy}
                          >
                            🗑️
                          </Button>
                        </Tooltip>
                      </div>
                    </div>

                    <p className="text-gray-600">{policy.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
                      {policy.cancellationFee && (
                        <div>
                          <strong>취소 수수료:</strong> {policy.cancellationFee}
                        </div>
                      )}
                      {policy.refundPercentage && (
                        <div>
                          <strong>환불 비율:</strong> {policy.refundPercentage}%
                        </div>
                      )}
                      {policy.noticePeriod && (
                        <div>
                          <strong>사전 통보:</strong> {policy.noticePeriod}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between text-gray-500 text-sm">
                      <span>생성일: {new Date(policy.createdAt).toLocaleDateString()}</span>
                      {policy.updatedAt !== policy.createdAt && (
                        <span>수정일: {new Date(policy.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 템플릿 목록 모달 */}
      <Modal 
        isOpen={isTemplateListOpen} 
        onClose={() => setIsTemplateListOpen(false)}
        size="lg"
        placement="center"
        classNames={{
          base: "max-w-2xl mx-auto",
          wrapper: "flex items-center justify-center p-4"
        }}
      >
        <ModalContent>
          <ModalHeader>취소규정 템플릿 목록</ModalHeader>
          <ModalBody>
            {templateList.length > 0 ? (
              <div className="space-y-4">
                {templateList.map((template, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-gray-500">
                          생성일: {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          정책 수: {template.data?.policies?.length || 0}개
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          color="primary"
                          size="sm"
                          onPress={() => loadSelectedTemplate(template)}
                        >
                          불러오기
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => {
                            if (confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
                              const updatedTemplates = templateList.filter(t => t.id !== template.id);
                              localStorage.setItem('cancelPolicyTemplates', JSON.stringify(updatedTemplates));
                              setTemplateList(updatedTemplates);
                              alert('템플릿이 삭제되었습니다.');
                            }
                          }}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">저장된 템플릿이 없습니다.</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsTemplateListOpen(false)}>
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default CancelPolicy 