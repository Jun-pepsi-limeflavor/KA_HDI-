import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Settings, Activity, Gauge, LucideIcon } from 'lucide-react';

interface FailureScenario {
  location: string;
  failureType: string;
  rul: number;
  anomalyScore: number;
  confidence: number;
  action: string;
  details: string;
  stftPattern: string;
  emCluster: string;
}

interface PipelineItem {
  name: string;
  connected: boolean;
}

interface PipelineSegment {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  items: PipelineItem[];
}

const KiboPoscoDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentFailureIndex] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  
  // EM-AAE 스핀들 고장 예측 시나리오들
  const failureScenarios: FailureScenario[] = [
    {
      location: "BACK ISO 워킹탱크 교반기",
      failureType: "워킹탱크 교반기 트립",
      rul: 48,
      anomalyScore: 0.807,
      confidence: 92,
      action: " 교반기 모터 점검 및 교반기 relay 확인",
      details: "교반기 SW on / MTK SV 105.0bar 미만 유지",
      stftPattern: "2-4kHz 대역 에너지 급증",
      emCluster: "교반기 이상 패턴 80% 유사성 및 Feeding pump pressure 이상 패턴 75% 매칭"
    },{
      location: "HARD ISO 컨디션탱크",
      failureType: "HARD ISO 컨디션탱크 원료 공급시간 초과",
      rul: 48,
      anomalyScore: 0.807,
      confidence: 92,
      action: " Feeding pump 밸브 상태 확인",
      details: "Feeding pump SV 105.0bar 미만 유지",
      stftPattern: "2-4kHz 대역 에너지 급증",
      emCluster: "교반기 이상 패턴 80% 유사성 및 Feeding pump pressure 이상 패턴 75% 매칭"
    }
  ];

  const currentScenario = failureScenarios[currentFailureIndex];

  // 파이프라인 세그멘트 데이터
  const pipelineSegments: PipelineSegment[] = [
    {
      id: '탱크 압력 제어 릴레이',
      title: '탱크 압력 제어 릴레이',
      icon: Gauge,
      color: 'text-blue-600',
      items: [
        { name: 'TK_Feed_VV_Open_P1', connected: false },
        { name: 'TK_Feed_VV_Out_P1', connected: false },
        { name: 'TK_Feed_Run_P1', connected: false },
        { name: 'TK_Heat_Out_P1', connected: false }
      ]
    },
    {
      id: '탱크 온도 제어 릴레이',
      title: '탱크 온도 제어 릴레이',
      icon: Activity,
      color: 'text-green-600',
      items: [
        { name: 'MTK_AG_On_Sw', connected: false },
        { name: 'MTK_AG_Run', connected: false },
        { name: 'MTK_Ex_Cool_Out', connected: false }
      ]
    },
    {
      id: '레벨 제어 릴레이',
      title: '레벨 제어 릴레이',
      icon: Settings,
      color: 'text-purple-600',
      items: [
        { name: 'STK_Pump_Pressure', connected: false },
        { name: 'STK_Feed_Flow_Rate', connected: false },
        { name: 'STK_Pump_Status', connected: false }
      ]
    },
    {
      id: '압력 제어 릴레이',
      title: '압력 제어 릴레이',
      icon: Activity,
      color: 'text-gray-600',
      items: [
        { name: 'Gain_HD1', connected: false },
        { name: 'Ana_Out_P1', connected: false },
        { name: 'Pump_InPress_Low_Delay_P1', connected: false },
      ]
    },
    {
      id: '레벨 제어 릴레이',
      title: '레벨 제어 릴레이',
      icon: AlertTriangle,
      color: 'text-orange-600',
      items: [
        { name: 'Cal_Nozzle_P7', connected: false },
        { name: 'Max_Capa_P7', connected: false },
        { name: 'Pump_On_Sw_P7', connected: false }
      ]
    }
  ];

  // 현재 표시할 3개 세그멘트
  const getVisibleSegments = (): PipelineSegment[] => {
    const segments: PipelineSegment[] = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentSegmentIndex + i) % pipelineSegments.length;
      const segment = pipelineSegments[index];
      if (segment) {
        segments.push(segment);
      }
    }
    return segments;
  };

  // 스핀들 트렌드 데이터 생성
  const generateSpindleData = () => {
    return Array.from({length: 48}, (_, i) => {
      const hour = i / 2;
      return {
        time: `${Math.floor(hour).toString().padStart(2, '0')}:${hour % 1 === 0 ? '00' : '30'}`,
        rpm: 0,  // 항상 0으로 고정
        vibration: 0,  // 항상 0으로 고정
        temperature: i <= 12 ? 20 : 40 + Math.cos((i-12)/5) * 3 + (i === 30 ? 8 : 0),
        torque: 85 + Math.sin(i/7) * 10 + (i === 30 ? 15 : 0),
        anomalyFlag: i === 30 || i === 42 || i === 18 ? 1 : 0
      };
    });
  };

  const [spindleData] = useState(generateSpindleData());



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Header with Machine Image */}
      <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="mb-2">
                <img 
                  src="/image/HDI_LOGO.png" 
                  alt="HDI Logo" 
                  className="h-16 w-auto saturate-150 brightness-200 contrast-150 drop-shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<h1 class="text-3xl font-bold mb-2 text-white">(주) 현대공업</h1>';
                    }
                  }}
                />
              </div>
              <p className="text-xl text-blue-100">울산공장 고압발포 제 2라인</p>
              <p className="text-sm text-blue-200 mt-2">High Pressure COLD 2nd line — 실시간 모니터링</p>
            </div>
            
          </div>
        </div>
        
        {/* Machine Visual */}
        {/* <div style={{ backgroundColor: 'rgb(38, 38, 38)' }} className="p-6 flex items-center justify-center">
          <div className="relative">
            <img 
              src="/image/HD1_Flowchart.png" 
              alt="CNC Machine" 
              className="w-full max-w-5xl h-55 object-contain rounded-lg opacity-80"
              onError={handleImageError}
            />
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg width-auto">
              ● PLC 연결 해제
            </div>
          </div>
          <div className="relative">
            <img 
              src="/image/HD2_Flowchart.png" 
              alt="CNC Machine" 
              className="w-full max-w-5xl h-55 object-contain rounded-lg opacity-80"
              onError={handleImageError}
            />
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg width-auto">
              ● PLC 연결 해제
            </div>
          </div>
          
        </div> */}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="text-sm text-gray-600 mb-1">이상 탐지 로그</div>
          <div className="text-2xl font-bold text-red-600 mb-2">#건 (최근 24h)</div>
          <AnomalyIndicator score= {0}/>
          <div className="text-xs text-gray-500 mt-2">LSTM-AAE 기반 실시간 감지</div>
        </div> */}

        {/* <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="text-sm text-gray-600 mb-1">MDI Pump Pressure 예측시간 </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">### Min</div>
              <div className="text-xs text-gray-500">MDI Pump SV: 105.0 bar</div>
            </div>
            <GaugeChart value={30} title="위험도" />
          </div>
        </div> */}

        {/* <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-1">POL (cPs)</div>
          <div className="text-2xl font-bold text-blue-600">### cPs</div>
          <div className="text-xs text-gray-500 mt-2">진동: ### g | 온도: ### ℃</div>
          <div className="text-xs text-gray-500">Level: ### m</div>
        </div> */}

        {/* <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-1">ISO (cPs)</div>
          <div className="text-2xl font-bold text-gray-900">### cPs</div>
          <div className="text-xs text-gray-500 mt-2">진동: ### g | 온도: ### ℃</div>
          <div className="text-xs text-gray-500">Level: ### m</div>
        </div> */}
      </div>

      {/* Pipeline */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">릴레이 실시간 모니터링</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentSegmentIndex((prev) => (prev - 1 + pipelineSegments.length) % pipelineSegments.length)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ←
            </button>
            <span className="px-3 py-2 text-sm text-gray-600">
              {currentSegmentIndex + 1}-{Math.min(currentSegmentIndex + 3, pipelineSegments.length)} / {pipelineSegments.length}
            </span>
            <button
              onClick={() => setCurrentSegmentIndex((prev) => (prev + 1) % pipelineSegments.length)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          {getVisibleSegments().map((segment, index) => (
            <div key={segment.id} className={`flex-1 text-center p-4 ${index < 2 ? 'border-r border-gray-200' : ''}`}>
              <div className={`font-bold ${segment.color} mb-3 flex items-center justify-center gap-2`}>
                <segment.icon className="w-5 h-5" />
                {segment.title}
              </div>
              
              {segment.id === 'STK_Feed_Pump' ? (
                <div>
                  <div className="space-y-2 mt-3">
                    {segment.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between px-2 py-1 bg-red-50 rounded-md border border-red-200">
                        <span className="text-xs font-medium text-gray-700">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-bold text-red-600">연결 해제</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {segment.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between px-2 py-1 bg-red-50 rounded-md border border-red-200">
                      <span className="text-xs font-medium text-gray-700">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-red-600">연결 해제</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Trend Chart */}
        <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-bold text-gray-900">압력 지표</div>
              <div className="text-sm text-gray-600">원료계 · level · 온도 · 유압계</div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spindleData.filter((_, i) => i % 4 === 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="rpm" orientation="left" domain={[0, 300]} />
                <YAxis yAxisId="temp" orientation="right" domain={[10, 60]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="rpm" type="monotone" dataKey="rpm" stroke="#3b82f6" strokeWidth={2} dot={false} name="원료계 압력지표" />
                <Line yAxisId="rpm" type="monotone" dataKey="vibration" stroke="#f97316" strokeWidth={2} dot={false} name="level 지표" />
                <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} name="TK/M/STK 온도지표(℃)" />
                {/* <Line yAxisId="rpm" type="monotone" dataKey="torque" stroke="#10b981" strokeWidth={2} dot={false} name="유압계 압력지표" /> */}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-bold text-gray-900">수위 지표</div>
              <div className="text-sm text-gray-600">원료계 · level · 온도 · 유압계</div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spindleData.filter((_, i) => i % 4 === 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="rpm" orientation="left" domain={[0, 300]} />
                <YAxis yAxisId="temp" orientation="right" domain={[10, 60]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="rpm" type="monotone" dataKey="rpm" stroke="#3b82f6" strokeWidth={2} dot={false} name="원료계 압력지표" />
                <Line yAxisId="rpm" type="monotone" dataKey="vibration" stroke="#f97316" strokeWidth={2} dot={false} name="level 지표" />
                <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} name="TK/M/STK 온도지표(℃)" />
                {/* <Line yAxisId="rpm" type="monotone" dataKey="torque" stroke="#10b981" strokeWidth={2} dot={false} name="유압계 압력지표" /> */}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-bold text-gray-900">온도 지표</div>
              <div className="text-sm text-gray-600">원료계 · level · 온도 · 유압계</div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spindleData.filter((_, i) => i % 4 === 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="rpm" orientation="left" domain={[0, 300]} />
                <YAxis yAxisId="temp" orientation="right" domain={[10, 60]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="rpm" type="monotone" dataKey="rpm" stroke="#3b82f6" strokeWidth={2} dot={false} name="원료계 압력지표" />
                <Line yAxisId="rpm" type="monotone" dataKey="vibration" stroke="#f97316" strokeWidth={2} dot={false} name="level 지표" />
                <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} name="TK/M/STK 온도지표(℃)" />
                {/* <Line yAxisId="rpm" type="monotone" dataKey="torque" stroke="#10b981" strokeWidth={2} dot={false} name="유압계 압력지표" /> */}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        
        

        {/* Health Radar */}
        {/* <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="font-bold text-gray-900 mb-3">펌프 · 탱크계 스코어 </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={healthRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="믹싱헤드" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      </div>

      

      {/* Bottom Section
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="font-bold text-gray-900 mb-3">PLC 시스템 모니터링</div>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">LS XGK CPU</div>
              <div className="text-lg font-semibold">##%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">메모리 사용량</div>
              <div className="text-lg font-semibold">#GB / 16GB</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">네트워크 지연</div>
              <div className="text-lg font-semibold">0.08s </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">데이터 전송율</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${transferProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{Math.round(transferProgress)}%</div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Modal */}
      {showModal && currentScenario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[480px] max-w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">알람 상세 — {currentScenario.location}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              이상 점수: {0.807} · RUL: {2}h
            </div>
            <div className="mb-4">
              <div className="font-bold mb-2">분석 결과</div>
              <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                <div>• 고장 유형: { "BACK ISO 워킹탱크 교반기 트립" }</div>
                <div>• {"BACK ISO AG 전원 컨트롤 BIT 메모리맵 OFF"}</div>
                <div>• 신뢰도: {"##"}%</div>
              </div>
            </div>
            <div className="mb-6">
              <div className="font-bold mb-2">권고 작업</div>
              <ol className="text-sm space-y-1 text-gray-700 list-decimal list-inside bg-blue-50 p-3 rounded-lg">
                <li>교반기 구동 모터 rpm 확인</li>
                <li>교반기 구동 모터 Relay 확인</li>
                <li>컨디션 탱크 Feeding pump 확인</li>
                <li>스코아 재확인</li>
              </ol>
            </div>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => {
                  alert('PLC 연결상태를 확인하세요.');
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                알람 수령 확인
              </button>
              <button 
                onClick={() => {
                  alert('PLC 연결상태를 확인하세요.');
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                정비 지시서 생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KiboPoscoDashboard;