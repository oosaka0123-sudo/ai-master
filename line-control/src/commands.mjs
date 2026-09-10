export const DEFAULT_ORCHESTRATOR_REPOSITORY = 'oosaka0123-sudo/ai-development-orchestrator';

export function buildOrchestratorDispatch(repository, command, orchestratorRepository = DEFAULT_ORCHESTRATOR_REPOSITORY) {
  if (!repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error('invalid target repository');
  if (!orchestratorRepository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(orchestratorRepository)) throw new Error('invalid orchestrator repository');
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
