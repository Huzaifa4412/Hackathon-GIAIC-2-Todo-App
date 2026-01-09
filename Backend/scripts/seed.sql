-- Seed script for Todo App
-- Inserts sample data for development and testing

-- ============================================================================
-- Sample Users
-- ============================================================================

INSERT INTO users (id, email, name) VALUES
    ('usr_seed_1', 'alice@example.com', 'Alice Johnson'),
    ('usr_seed_2', 'bob@example.com', 'Bob Smith'),
    ('usr_seed_3', 'charlie@example.com', 'Charlie Brown')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Sample Tasks for Alice
-- ============================================================================

INSERT INTO tasks (id, user_id, title, description, status, due_date) VALUES
    (
        'tsk_seed_1',
        'usr_seed_1',
        'Complete project proposal',
        'Write a detailed proposal for the Q1 project including timeline and budget estimates.',
        'in_progress',
        NOW() + INTERVAL '7 days'
    ),
    (
        'tsk_seed_2',
        'usr_seed_1',
        'Review pull requests',
        'Review and approve pending PRs from the team.',
        'pending',
        NOW() + INTERVAL '2 days'
    ),
    (
        'tsk_seed_3',
        'usr_seed_1',
        'Update documentation',
        'Add API documentation for the new endpoints.',
        'completed',
        NOW() - INTERVAL '1 day'
    ),
    (
        'tsk_seed_4',
        'usr_seed_1',
        'Team standup meeting',
        'Daily standup with the development team.',
        'pending',
        NOW() + INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Sample Tasks for Bob
-- ============================================================================

INSERT INTO tasks (id, user_id, title, description, status, due_date) VALUES
    (
        'tsk_seed_5',
        'usr_seed_2',
        'Fix authentication bug',
        'Users are getting logged out unexpectedly. Investigate and fix the issue.',
        'pending',
        NOW() + INTERVAL '3 days'
    ),
    (
        'tsk_seed_6',
        'usr_seed_2',
        'Database optimization',
        'Optimize slow queries and add missing indexes.',
        'in_progress',
        NOW() + INTERVAL '5 days'
    ),
    (
        'tsk_seed_7',
        'usr_seed_2',
        'Write unit tests',
        'Increase test coverage to 80% for the authentication module.',
        'pending',
        NOW() + INTERVAL '10 days'
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Sample Tasks for Charlie
-- ============================================================================

INSERT INTO tasks (id, user_id, title, description, status, due_date) VALUES
    (
        'tsk_seed_8',
        'usr_seed_3',
        'Design new landing page',
        'Create mockups for the new marketing landing page.',
        'completed',
        NOW() - INTERVAL '2 days'
    ),
    (
        'tsk_seed_9',
        'usr_seed_3',
        'User research interviews',
        'Conduct 5 user interviews for the new feature.',
        'in_progress',
        NOW() + INTERVAL '4 days'
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Verification Query
-- ============================================================================

-- Uncomment to verify seed data
-- SELECT u.email, COUNT(t.id) as task_count
-- FROM users u
-- LEFT JOIN tasks t ON u.id = t.user_id
-- GROUP BY u.email
-- ORDER BY u.email;
