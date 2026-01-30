
-- This schema represents the core data model for the YemenJPT platform,
-- focusing on user management, tool access, and audit logging as per the architectural design.

-- ----------------------------------------------------------------------
-- 1. USER & ROLE MANAGEMENT (RBAC)
-- ----------------------------------------------------------------------

CREATE TABLE roles (
    role_name VARCHAR(50) PRIMARY KEY,
    description TEXT
);

INSERT INTO roles (role_name, description) VALUES
('super-admin', 'Full control over the entire platform, including system settings and user management.'),
('editor-in-chief', 'Manages editorial workflow, projects, and has access to most tools.'),
('investigative-journalist', 'Primary user role, with access to a defined set of investigative tools.'),
('public', 'Guest access, limited to public-facing information.');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255), -- For local authentication
    role_name VARCHAR(50) REFERENCES roles(role_name) ON UPDATE CASCADE ON DELETE SET NULL,
    avatar_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active', -- e.g., 'active', 'suspended'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------
-- 2. TOOL & PERMISSION MANAGEMENT
-- ----------------------------------------------------------------------

CREATE TABLE tools (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Junction table to link roles to the tools they can access
CREATE TABLE tool_permissions (
    role_name VARCHAR(50) REFERENCES roles(role_name) ON DELETE CASCADE,
    tool_id VARCHAR(100) REFERENCES tools(id) ON DELETE CASCADE,
    PRIMARY KEY (role_name, tool_id)
);


-- ----------------------------------------------------------------------
-- 3. AUDIT LOGGING (MCP & General Actions)
-- ----------------------------------------------------------------------

CREATE TABLE ai_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    prompt TEXT NOT NULL,
    response_text TEXT,
    response_metadata JSONB, -- To store function calls, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tool_executions (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    tool_id VARCHAR(100) REFERENCES tools(id) ON DELETE CASCADE,
    triggered_by VARCHAR(50) DEFAULT 'user', -- 'user' or 'ai'
    ai_request_id BIGINT REFERENCES ai_requests(id) ON DELETE SET NULL, -- Link to AI prompt if triggered by AI
    parameters JSONB, -- Any parameters passed to the tool
    status VARCHAR(50), -- e.g., 'started', 'completed', 'failed'
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------
-- 5. DASTOOR METER (Constitution Meter)
-- ----------------------------------------------------------------------

CREATE TABLE dastoor_violations (
    id SERIAL PRIMARY KEY,
    official_name VARCHAR(255),
    entity_name VARCHAR(255),
    violation_date DATE,
    law_violated VARCHAR(255),
    severity_score INTEGER CHECK (severity_score >= 1 AND severity_score <= 10),
    summary TEXT,
    status VARCHAR(20) DEFAULT 'New', -- 'New', 'Verified', 'Published'
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Example: Populate some tools from tool.service.ts
INSERT INTO tools (id, name, category, is_active) VALUES
('spiderfoot', 'SpiderFoot', 'التقصي والاستخبارات مفتوحة المصدر', true),
('sherlock-maigret', 'Sherlock', 'تحليل الإعلام الاجتماعي', true),
('archivebox', 'ArchiveBox', 'الأرشفة والتوثيق الرقمي', true),
('n8n', 'n8n', 'الأتمتة وسير العمل', true),
('superdesk', 'Superdesk', 'إدارة غرفة الأخبار والنشر', true),
('dastoor-meter', 'دستور-ميتر', 'المساءلة والرقابة', true);

-- Example: Granting permissions
INSERT INTO tool_permissions (role_name, tool_id) VALUES
('investigative-journalist', 'spiderfoot'),
('investigative-journalist', 'sherlock-maigret'),
('editor-in-chief', 'superdesk'),
('investigative-journalist', 'dastoor-meter');