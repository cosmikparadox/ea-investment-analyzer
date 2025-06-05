import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

function App() {
  const [enabledMetrics, setEnabledMetrics] = React.useState({
    pipeline: true,
    dealSize: true,
    winRate: true,
    salesCycle: false,
    retention: false,
    grossMargin: false,
    expansion: false,
    arr: false,
    nps: false,
    churn: false,
    cltv: false
  });

  const [inputs, setInputs] = React.useState({
    pipeline: 10000000,
    dealSize: 100000,
    winRate: 25,
    eaCost: 200000,
    salesCycle: 9,
    retention: 85,
    teamSize: 8,
    grossMargin: 65,
    expansion: 12,
    arr: 5000000,
    nps: 35,
    churn: 18,
    cltv: 250000,
    additionalSalesRep: 150000,
    marketingSpend: 300000,
    salesTraining: 100000
  });

  const [riskFactors, setRiskFactors] = React.useState({
    pipeline: { probability: 70, evidence: 'some', risk: 'medium' },
    dealSize: { probability: 65, evidence: 'anecdotal', risk: 'medium' },
    winRate: { probability: 80, evidence: 'strong', risk: 'low' },
    salesCycle: { probability: 60, evidence: 'some', risk: 'high' },
    retention: { probability: 75, evidence: 'strong', risk: 'low' },
    teamSize: { probability: 85, evidence: 'strong', risk: 'low' },
    grossMargin: { probability: 55, evidence: 'anecdotal', risk: 'high' },
    expansion: { probability: 70, evidence: 'some', risk: 'medium' },
    arr: { probability: 65, evidence: 'some', risk: 'medium' },
    nps: { probability: 80, evidence: 'strong', risk: 'low' },
    churn: { probability: 75, evidence: 'strong', risk: 'low' },
    cltv: { probability: 60, evidence: 'some', risk: 'medium' }
  });

  const [results, setResults] = React.useState(null);
  const [activeView, setActiveView] = React.useState('scenarios');
  const [selectedScenario, setSelectedScenario] = React.useState('realistic');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const baseUplifts = {
    pipeline: 0.20,
    teamSize: 0.15,
    winRate: 0.35,
    dealSize: 0.25,
    salesCycle: -0.30,
    retention: 0.15,
    grossMargin: 0.10,
    expansion: 0.25,
    arr: 0.20,
    nps: 0.30,
    churn: -0.25,
    cltv: 0.18
  };

  const scenarioMultipliers = {
    conservative: 0.5,
    realistic: 1.0,
    optimistic: 1.5
  };

  const evidenceWeights = {
    none: 0.3,
    anecdotal: 0.6,
    some: 0.8,
    strong: 1.0
  };

  const riskAdjustments = {
    low: 1.0,
    medium: 0.85,
    high: 0.7
  };

  const metricConfig = {
    pipeline: { label: 'Annual Pipeline Value ($)', type: 'currency', color: '#3B82F6' },
    dealSize: { label: 'Average Deal Size ($)', type: 'currency', color: '#10B981' },
    winRate: { label: 'Current Win Rate (%)', type: 'percentage', color: '#F59E0B' },
    salesCycle: { label: 'Sales Cycle (months)', type: 'number', color: '#EF4444' },
    retention: { label: 'Customer Retention (%)', type: 'percentage', color: '#06B6D4' },
    teamSize: { label: 'Sales Team Size', type: 'number', color: '#8B5CF6' },
    grossMargin: { label: 'Gross Margin (%)', type: 'percentage', color: '#84CC16' },
    expansion: { label: 'Expansion Rate (%)', type: 'percentage', color: '#F97316' },
    arr: { label: 'Annual Recurring Revenue ($)', type: 'currency', color: '#EC4899' },
    nps: { label: 'Net Promoter Score', type: 'number', color: '#6366F1' },
    churn: { label: 'Churn Rate (%)', type: 'percentage', color: '#DC2626' },
    cltv: { label: 'Customer Lifetime Value ($)', type: 'currency', color: '#059669' },
    eaCost: { label: 'EA Annual Investment ($)', type: 'currency', color: '#64748B' }
  };

  function toggleMetric(metric) {
    setEnabledMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  }

  function updateInput(field, value) {
    const numValue = Number(value) || 0;
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
  }

  function updateRiskFactor(metric, field, value) {
    setRiskFactors(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [field]: field === 'probability' ? Number(value) : value
      }
    }));
  }

  function calculateScenario(scenario) {
    const multiplier = scenarioMultipliers[scenario];
    const current = {};
    const projected = {};
    const improvements = {};
    let totalAnnualBenefit = 0;

    current.revenue = inputs.pipeline * (inputs.winRate / 100);
    current.pipeline = inputs.pipeline;
    current.teamSize = inputs.teamSize;
    current.winRate = inputs.winRate;
    current.dealSize = inputs.dealSize;
    current.salesCycle = inputs.salesCycle;
    current.retention = inputs.retention;
    current.grossMargin = inputs.grossMargin;
    current.expansion = inputs.expansion;
    current.arr = inputs.arr;
    current.nps = inputs.nps;
    current.churn = inputs.churn;
    current.cltv = inputs.cltv;

    let revenueGains = 0;

    Object.keys(enabledMetrics).forEach(metric => {
      if (enabledMetrics[metric] && baseUplifts[metric] !== undefined) {
        const baseUplift = baseUplifts[metric];
        const evidenceWeight = evidenceWeights[riskFactors[metric].evidence];
        const riskAdjustment = riskAdjustments[riskFactors[metric].risk];
        const probabilityWeight = riskFactors[metric].probability / 100;
        
        const adjustedUplift = baseUplift * multiplier * evidenceWeight * riskAdjustment * probabilityWeight;

        if (metric === 'pipeline') {
          projected.pipeline = inputs.pipeline * (1 + adjustedUplift);
          improvements.pipeline = projected.pipeline - current.pipeline;
        } else if (metric === 'winRate') {
          projected.winRate = inputs.winRate * (1 + adjustedUplift);
          const winRateRevenue = inputs.pipeline * (projected.winRate / 100);
          const winRateGain = winRateRevenue - current.revenue;
          revenueGains += winRateGain;
          improvements.winRate = projected.winRate - current.winRate;
        } else if (metric === 'dealSize') {
          projected.dealSize = inputs.dealSize * (1 + adjustedUplift);
          const dealSizeGain = (inputs.pipeline / inputs.dealSize) * (projected.dealSize - inputs.dealSize) * (inputs.winRate / 100);
          revenueGains += dealSizeGain;
          improvements.dealSize = projected.dealSize - current.dealSize;
        } else if (metric === 'salesCycle') {
          projected.salesCycle = inputs.salesCycle * (1 + adjustedUplift);
          const cycleGain = current.revenue * Math.abs(adjustedUplift);
          revenueGains += cycleGain;
          improvements.salesCycle = current.salesCycle - projected.salesCycle;
        } else if (metric === 'retention') {
          projected.retention = Math.min(95, inputs.retention * (1 + adjustedUplift));
          const retentionGain = current.revenue * (adjustedUplift * 0.8);
          totalAnnualBenefit += retentionGain;
          improvements.retention = projected.retention - current.retention;
        } else if (metric === 'grossMargin') {
          projected.grossMargin = Math.min(90, inputs.grossMargin * (1 + adjustedUplift));
          const marginGain = (current.revenue + revenueGains) * (adjustedUplift * (inputs.grossMargin / 100));
          totalAnnualBenefit += marginGain;
          improvements.grossMargin = projected.grossMargin - current.grossMargin;
        } else if (metric === 'expansion') {
          projected.expansion = inputs.expansion * (1 + adjustedUplift);
          const expansionGain = current.revenue * (adjustedUplift * (inputs.expansion / 100));
          totalAnnualBenefit += expansionGain;
          improvements.expansion = projected.expansion - current.expansion;
        } else if (metric === 'arr') {
          projected.arr = inputs.arr * (1 + adjustedUplift);
          const arrGain = projected.arr - current.arr;
          totalAnnualBenefit += arrGain * 0.3;
          improvements.arr = arrGain;
        } else if (metric === 'nps') {
          projected.nps = Math.min(80, inputs.nps * (1 + adjustedUplift));
          const npsGain = current.revenue * (adjustedUplift * 0.1);
          totalAnnualBenefit += npsGain;
          improvements.nps = projected.nps - current.nps;
        } else if (metric === 'churn') {
          projected.churn = Math.max(2, inputs.churn * (1 + adjustedUplift));
          const churnGain = current.revenue * (Math.abs(adjustedUplift) * (inputs.churn / 100));
          totalAnnualBenefit += churnGain;
          improvements.churn = current.churn - projected.churn;
        } else if (metric === 'cltv') {
          projected.cltv = inputs.cltv * (1 + adjustedUplift);
          improvements.cltv = projected.cltv - current.cltv;
        } else if (metric === 'teamSize') {
          projected.teamSize = Math.ceil(inputs.teamSize * (1 + adjustedUplift));
          improvements.teamSize = projected.teamSize - current.teamSize;
        }
      } else {
        projected[metric] = current[metric];
        improvements[metric] = 0;
      }
    });

    projected.revenue = current.revenue + revenueGains;
    improvements.revenue = revenueGains;
    totalAnnualBenefit += revenueGains;

    projected.roi = inputs.eaCost > 0 ? ((totalAnnualBenefit - inputs.eaCost) / inputs.eaCost) * 100 : 0;
    projected.paybackMonths = totalAnnualBenefit > 0 ? (inputs.eaCost / totalAnnualBenefit) * 12 : 0;
    projected.netPresentValue = (totalAnnualBenefit * 3) - inputs.eaCost;

    return {
      current,
      projected,
      improvements,
      totalAnnualBenefit,
      scenario
    };
  }

  function calculate() {
    try {
      const scenarios = {
        conservative: calculateScenario('conservative'),
        realistic: calculateScenario('realistic'),
        optimistic: calculateScenario('optimistic')
      };

      const alternatives = {
        salesRep: {
          cost: inputs.additionalSalesRep,
          benefit: inputs.additionalSalesRep * 4,
          roi: ((inputs.additionalSalesRep * 4 - inputs.additionalSalesRep) / inputs.additionalSalesRep) * 100
        },
        marketing: {
          cost: inputs.marketingSpend,
          benefit: inputs.marketingSpend * 2.5,
          roi: ((inputs.marketingSpend * 2.5 - inputs.marketingSpend) / inputs.marketingSpend) * 100
        },
        training: {
          cost: inputs.salesTraining,
          benefit: inputs.salesTraining * 3,
          roi: ((inputs.salesTraining * 3 - inputs.salesTraining) / inputs.salesTraining) * 100
        }
      };

      const confidenceScore = calculateConfidenceScore();

      setResults({
        scenarios,
        alternatives,
        confidenceScore
      });
    } catch (error) {
      alert('Error in calculation. Please check your inputs.');
    }
  }

  function calculateConfidenceScore() {
    let totalWeight = 0;
    let weightedScore = 0;

    Object.keys(enabledMetrics).forEach(metric => {
      if (enabledMetrics[metric] && riskFactors[metric]) {
        const evidenceScore = evidenceWeights[riskFactors[metric].evidence] * 100;
        const riskScore = riskAdjustments[riskFactors[metric].risk] * 100;
        const probabilityScore = riskFactors[metric].probability;
        
        const metricScore = (evidenceScore + riskScore + probabilityScore) / 3;
        weightedScore += metricScore;
        totalWeight += 1;
      }
    });

    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }

  function formatCurrency(value) {
    const num = Number(value) || 0;
    return '$' + num.toLocaleString();
  }

  function formatNumber(value, decimals = 1) {
    const num = Number(value) || 0;
    return num.toFixed(decimals);
  }

  function formatPercentage(value) {
    const num = Number(value) || 0;
    return num.toFixed(1) + '%';
  }

  function getScenarioComparisonData() {
    if (!results) return [];
    return [
      {
        scenario: 'Conservative',
        roi: results.scenarios.conservative.projected.roi,
        benefit: results.scenarios.conservative.totalAnnualBenefit,
        payback: results.scenarios.conservative.projected.paybackMonths
      },
      {
        scenario: 'Realistic',
        roi: results.scenarios.realistic.projected.roi,
        benefit: results.scenarios.realistic.totalAnnualBenefit,
        payback: results.scenarios.realistic.projected.paybackMonths
      },
      {
        scenario: 'Optimistic',
        roi: results.scenarios.optimistic.projected.roi,
        benefit: results.scenarios.optimistic.totalAnnualBenefit,
        payback: results.scenarios.optimistic.projected.paybackMonths
      }
    ];
  }

  function getAlternativeComparisonData() {
    if (!results) return [];
    return [
      {
        investment: 'Enterprise Architect',
        cost: inputs.eaCost,
        roi: results.scenarios.realistic.projected.roi,
        risk: 'Medium',
        payback: results.scenarios.realistic.projected.paybackMonths
      },
      {
        investment: 'Additional Sales Rep',
        cost: inputs.additionalSalesRep,
        roi: results.alternatives.salesRep.roi,
        risk: 'Low',
        payback: 3
      },
      {
        investment: 'Marketing Campaign',
        cost: inputs.marketingSpend,
        roi: results.alternatives.marketing.roi,
        risk: 'High',
        payback: 6
      },
      {
        investment: 'Sales Training',
        cost: inputs.salesTraining,
        roi: results.alternatives.training.roi,
        risk: 'Low',
        payback: 4
      }
    ];
  }

function getSensitivityData() {
  if (!results) return [];
  
  const baseROI = results.scenarios.realistic.projected.roi;
  const sensitivityData = [];

  Object.keys(enabledMetrics).forEach(metric => {
    if (enabledMetrics[metric] && baseUplifts[metric] !== undefined) {
      // Calculate impact by changing probability by ±20%
      const originalProb = riskFactors[metric].probability;
      
      // High scenario (+20% probability)
      const tempRiskFactors = { ...riskFactors };
      tempRiskFactors[metric] = {
        ...tempRiskFactors[metric],
        probability: Math.min(100, originalProb + 20)
      };
      
      // Temporarily update risk factors
      const originalRiskFactor = riskFactors[metric];
      riskFactors[metric] = tempRiskFactors[metric];
      const highScenario = calculateScenario('realistic');
      riskFactors[metric] = originalRiskFactor; // Restore
      
      const impact = Math.abs(highScenario.projected.roi - baseROI);
      
      sensitivityData.push({
        metric: metricConfig[metric]?.label || metric,
        impact: Math.max(impact, 0.1), // Ensure minimum visible value
        color: metricConfig[metric]?.color || '#3B82F6'
      });
    }
  });

  return sensitivityData.sort((a, b) => b.impact - a.impact).slice(0, 8);
}

function getRiskReturnData() {
  if (!results) return [];
  
  return [
    { 
      risk: 3, 
      return: results.scenarios.conservative.projected.roi, 
      name: 'Conservative',
      size: 100
    },
    { 
      risk: 5, 
      return: results.scenarios.realistic.projected.roi, 
      name: 'Realistic',
      size: 150
    },
    { 
      risk: 7, 
      return: results.scenarios.optimistic.projected.roi, 
      name: 'Optimistic',
      size: 200
    }
  ];
}

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${sidebarCollapsed ? 'w-28' : 'w-80'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
        <div className="p-4 overflow-y-auto h-full">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && <h2 className="text-xl font-bold text-green-700">EA Investment Analysis</h2>}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded hover:bg-gray-100"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
          
          {sidebarCollapsed ? (
            <div className="space-y-4 text-center">
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-xs text-gray-600">Metrics</div>
                <div className="text-lg font-bold text-blue-600">{Object.values(enabledMetrics).filter(Boolean).length}</div>
              </div>
              {results && (
                <>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-xs text-gray-600">Confidence</div>
                    <div className="text-sm font-bold text-green-600">{results.confidenceScore}%</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <div className="text-xs text-gray-600">ROI Range</div>
                    <div className="text-xs font-semibold text-yellow-600">
                      {formatPercentage(results.scenarios.conservative.projected.roi)} - {formatPercentage(results.scenarios.optimistic.projected.roi)}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Enable Metrics:</h3>
                {Object.entries(metricConfig).filter(([key]) => key !== 'eaCost').map(([key, config]) => (
                  <label key={key} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={enabledMetrics[key]}
                      onChange={() => toggleMetric(key)}
                      className="mr-2"
                    />
                    <span className="text-sm">{config.label}</span>
                  </label>
                ))}
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-3 text-gray-700">Analysis View:</h3>
                <select 
                  value={activeView} 
                  onChange={(e) => setActiveView(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="scenarios">Scenario Analysis</option>
                  <option value="alternatives">Investment Comparison</option>
                  <option value="sensitivity">Sensitivity Analysis</option>
                  <option value="risk">Risk Assessment</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-sm border-b mb-6 p-4 rounded-lg">
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Architect Investment Analysis</h1>
            <p className="text-gray-600 mt-1">Risk-adjusted ROI modeling with scenario planning and comparative analysis</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Business Inputs</h2>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(metricConfig).map(([key, config]) => 
                  (enabledMetrics[key] || key === 'eaCost') && (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{config.label}</label>
                      <input
                        type="number"
                        value={inputs[key]}
                        onChange={(e) => updateInput(key, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Alternative Investments</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Sales Rep Cost ($)</label>
                  <input
                    type="number"
                    value={inputs.additionalSalesRep}
                    onChange={(e) => updateInput('additionalSalesRep', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Campaign Cost ($)</label>
                  <input
                    type="number"
                    value={inputs.marketingSpend}
                    onChange={(e) => updateInput('marketingSpend', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Training Cost ($)</label>
                  <input
                    type="number"
                    value={inputs.salesTraining}
                    onChange={(e) => updateInput('salesTraining', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Metric</th>
                    <th className="text-left p-2">Success Probability (%)</th>
                    <th className="text-left p-2">Evidence Level</th>
                    <th className="text-left p-2">Implementation Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(enabledMetrics).filter(key => enabledMetrics[key]).map(key => (
                    <tr key={key} className="border-b">
                      <td className="p-2 font-medium">{metricConfig[key]?.label}</td>
                      <td className="p-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={riskFactors[key]?.probability || 70}
                          onChange={(e) => updateRiskFactor(key, 'probability', e.target.value)}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-600">{riskFactors[key]?.probability || 70}%</span>
                      </td>
                      <td className="p-2">
                        <select
                          value={riskFactors[key]?.evidence || 'some'}
                          onChange={(e) => updateRiskFactor(key, 'evidence', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="none">None</option>
                          <option value="anecdotal">Anecdotal</option>
                          <option value="some">Some Data</option>
                          <option value="strong">Strong Data</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={riskFactors[key]?.risk || 'medium'}
                          onChange={(e) => updateRiskFactor(key, 'risk', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button 
            onClick={calculate}
            className="mb-6 bg-green-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-green-700"
          >
            Run Investment Analysis
          </button>

          {results && (
            <div className="space-y-6">
              {activeView === 'scenarios' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      Scenario Analysis
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        results.confidenceScore >= 80 ? 'bg-green-100 text-green-800' :
                        results.confidenceScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {results.confidenceScore}% Confidence
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {['conservative', 'realistic', 'optimistic'].map(scenario => (
                        <div key={scenario} className={`p-4 rounded border-2 ${selectedScenario === scenario ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold capitalize">{scenario} Case</h4>
                            <button
                              onClick={() => setSelectedScenario(scenario)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Select
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">ROI</div>
                              <div className={`font-semibold ${results.scenarios[scenario].projected.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(results.scenarios[scenario].projected.roi)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Annual Benefit</div>
                              <div className="font-semibold text-blue-600">
                                {formatCurrency(results.scenarios[scenario].totalAnnualBenefit)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Payback</div>
                              <div className="font-semibold text-purple-600">
                                {formatNumber(results.scenarios[scenario].projected.paybackMonths)} mo
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">ROI Comparison by Scenario</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getScenarioComparisonData()}>
                        <XAxis dataKey="scenario" />
                        <YAxis label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                        <Bar dataKey="roi" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeView === 'alternatives' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Investment Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Investment Option</th>
                          <th className="text-left p-3">Cost</th>
                          <th className="text-left p-3">ROI</th>
                          <th className="text-left p-3">Risk Level</th>
                          <th className="text-left p-3">Payback (months)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getAlternativeComparisonData().map((alt, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{alt.investment}</td>
                            <td className="p-3">{formatCurrency(alt.cost)}</td>
                            <td className={`p-3 font-semibold ${alt.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercentage(alt.roi)}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                alt.risk === 'Low' ? 'bg-green-100 text-green-800' :
                                alt.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {alt.risk}
                              </span>
                            </td>
                            <td className="p-3">{alt.payback}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeView === 'sensitivity' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Sensitivity Analysis - ROI Impact by Metric</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getSensitivityData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis 
                        dataKey="metric" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        interval={0}
                      />
                      <YAxis label={{ value: 'ROI Impact (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'ROI Impact']} />
                      <Bar dataKey="impact" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeView === 'risk' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Risk vs Return Analysis</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={getRiskReturnData()}>
                        <XAxis dataKey="risk" label={{ value: 'Risk Level', position: 'insideBottom', offset: -5 }} />
                        <YAxis dataKey="return" label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value, name) => [value.toFixed(1) + '%', name]} />
                        <Scatter dataKey="return">
                          {getRiskReturnData().map((entry, index) => (
                           <Scatter key={index} fill={index === 0 ? '#EF4444' : index === 1 ? '#F59E0B' : '#10B981'} />
                            ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Key Risk Factors</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 rounded">
                        <h4 className="font-medium text-red-800">High Risk Metrics</h4>
                        <p className="text-sm text-red-600">
                          {Object.keys(enabledMetrics).filter(key => 
                            enabledMetrics[key] && riskFactors[key]?.risk === 'high'
                          ).map(key => metricConfig[key]?.label).join(', ') || 'None identified'}
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded">
                        <h4 className="font-medium text-yellow-800">Limited Evidence</h4>
                        <p className="text-sm text-yellow-600">
                          {Object.keys(enabledMetrics).filter(key => 
                            enabledMetrics[key] && ['none', 'anecdotal'].includes(riskFactors[key]?.evidence)
                          ).map(key => metricConfig[key]?.label).join(', ') || 'None identified'}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded">
                        <h4 className="font-medium text-blue-800">Recommendation</h4>
                        <p className="text-sm text-blue-600">
                          {results.confidenceScore >= 70 
                            ? 'Strong business case with acceptable risk profile'
                            : 'Consider pilot program or additional data collection before full investment'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;