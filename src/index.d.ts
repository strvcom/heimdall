import type { Delegate } from './delegate';
/**
 * The process status gatekeeper
 *
 * @param     {Delegate<Runtime>}    delegate   Object or class responsible for acting when the
 *                                              process changes its state
 * @return    {Promise}                         Returns whatever the Delegate's .execute() returns
 */
declare function heimdall<Runtime>(delegate: Delegate<Runtime>): Promise<void>;
export { heimdall, Delegate, };
//# sourceMappingURL=index.d.ts.map