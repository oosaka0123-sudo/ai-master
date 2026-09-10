export const DEFAULT_ORCHESTRATOR_REPOSITORY = 'oosaka0123-sudo/ai-development-orchestrator';

const SEGMENT = /^[A-Za-z0-9_.-]+$/;

function validRepository(value) {
  if (!value || typeof value !== 'string') return false;
  const parts = value.split('/');
  return parts.length === 2
    && parts.every(part => SEGMENT.test(part) && part !== '.' && part !== '..');
}

export function buildOrchestratorDispatch(repository, command, orchestratorRepository = DEFAULT_ORCHESTRATOR_REPOSITORY) {
  if (!validRepository(repository)) throw new Error('invalid target repository');
  if (!validRepository(orchestratorRepository)) throw new Error('invalid orchestrator repository');
  if (!['continue', 'resume'].includes(command)) throw new Error('unsupported command');

  return {
    path: `/repos/${orchestratorRepository}/dispatches`,
    body: {
      event_type: 'line-control',
      client_payload: {
        repository,
        command,
        source: 'line-control',
        requested_at: new Date().toISOString()
      }
    }
  };
}
