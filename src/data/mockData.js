export const pipelineStages = [
    { id: 'ingestion', label: 'Data Ingestion', description: 'Normalizing heterogeneous communication streams', progress: 100, status: 'complete' },
    { id: 'extraction', label: 'Requirement Extraction', description: 'Identifying functional and non-functional specs', progress: 100, status: 'complete' },
    { id: 'conflict', label: 'Conflict Detection', description: 'Mapping contradictions and overlapping requirements', progress: 65, status: 'processing' },
    { id: 'provenance', label: 'Provenance Mapping', description: 'Building full traceability back to source nodes', progress: 0, status: 'pending' },
    { id: 'generation', label: 'BRD Synthesis', description: 'Structuring document with legal and technical compliance', progress: 0, status: 'pending' },
];

export const metricsData = [
    { name: 'Mon', count: 45 },
    { name: 'Tue', count: 52 },
    { name: 'Wed', count: 48 },
    { name: 'Thu', count: 70 },
    { name: 'Fri', count: 61 },
    { name: 'Sat', count: 32 },
    { name: 'Sun', count: 28 },
];

export const healthScore = 88;

export const conflicts = [
    {
        id: 'CF-001',
        severity: 'High',
        title: 'Data Retention Policy Mismatch',
        description: 'Meeting notes suggest 7-year retention, while Slack discussion mentions 5-year limit per recent compliance audit.',
        requirements: ['REQ-402', 'REQ-405'],
        sources: ['Meeting_Transcript_Q3.docx', 'Slack_Export_Compliance.json']
    },
    {
        id: 'CF-002',
        severity: 'Medium',
        title: 'Auth Protocol Ambiguity',
        description: 'Project Roadmap mentions OAuth2, while Technical Specs draft references SAML 2.0.',
        requirements: ['REQ-101'],
        sources: ['Product_Roadmap_V2.pdf', 'Technical_Specs_Draft.docx']
    }
];

export const brdSections = [
    {
        id: 'sec-1',
        title: 'Executive Summary',
        content: 'The BRDGen platform aims to automate the synthesis of complex business communications into structured documentation...',
    },
    {
        id: 'sec-2',
        title: 'Functional Requirements',
        requirements: [
            { id: 'REQ-101', text: 'The system must support multi-source ingestion including Email, Slack, and Document uploads.', status: 'verified', source: 'Email_Thread_CEO.msg' },
            { id: 'REQ-102', text: 'Real-time NLP processing must occur upon project initialization.', status: 'processing', source: 'Slack_Dev_Team.json' },
            { id: 'REQ-103', text: 'Export capabilities should include PDF, Word, and JIRA integration.', status: 'conflict', source: 'Meeting_Notes_Dec.docx' }
        ]
    }
];
