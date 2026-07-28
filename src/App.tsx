import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { MainLayout } from './layout/MainLayout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { PromptEngineeringStudio } from './pages/PromptEngineeringStudio';
import { KnowledgeStudio } from './pages/KnowledgeStudio';
import { WorkflowStudio } from './pages/WorkflowStudio';
import { MultiAgentStudio } from './pages/MultiAgentStudio';
import { ObservabilityCenter } from './pages/ObservabilityCenter';
import { EvaluationCenter } from './pages/EvaluationCenter';
import { ArchitectureLearning } from './pages/ArchitectureLearning';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="prompt-engineering" element={<PromptEngineeringStudio />} />
            <Route path="knowledge-studio" element={<KnowledgeStudio />} />
            <Route path="langgraph-studio" element={<WorkflowStudio />} />
            <Route path="workflow-studio" element={<WorkflowStudio />} />
            <Route path="multi-agent" element={<MultiAgentStudio />} />
            <Route path="multi-agent-studio" element={<MultiAgentStudio />} />
            <Route path="evaluation" element={<EvaluationCenter />} />
            <Route path="evaluation-center" element={<EvaluationCenter />} />
            <Route path="observability" element={<ObservabilityCenter />} />
            <Route path="observability-center" element={<ObservabilityCenter />} />
            <Route path="architecture" element={<ArchitectureLearning />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
};

export default App;
