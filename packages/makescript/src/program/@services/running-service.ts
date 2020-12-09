import {ScriptRunningArgumentParameters} from '@makeflow/makescript-agent';
import {v4 as uuidv4} from 'uuid';

import {
  ExpectedError,
  RunningRecordModel,
  RunningRecordModelMakeflowInfo,
} from '../@core';
import {Config} from '../config';
import {RunningRecord, RunningRecordMakeflowInfo} from '../types';

import {AgentService} from './agent-service';
import {DBService} from './db-service';

export class RunningService {
  get runningRecords(): RunningRecord[] {
    let runningRecordModels = this.dbService.db.get('records').value();

    return runningRecordModels.map(model => convertRecordModelToRecord(model));
  }

  constructor(
    private agentService: AgentService,
    private dbService: DBService,
    private config: Config,
  ) {}

  async enqueueRunningRecord({
    namespace,
    name,
    parameters,
    triggerTokenLabel,
    makeflowTask,
  }: {
    namespace: string;
    name: string;
    parameters: ScriptRunningArgumentParameters;
    triggerTokenLabel: string;
    makeflowTask: RunningRecordModelMakeflowInfo | undefined;
  }): Promise<string> {
    // TODO: Filter parameters
    let insertedRecords = await this.dbService.db
      .get('records')
      .unshift({
        id: uuidv4(),
        namespace,
        name,
        parameters,
        deniedParameters: {},
        triggerTokenLabel,
        makeflow: makeflowTask,
        result: undefined,
        output: undefined,
        createdAt: Date.now(),
        ranAt: undefined,
      })
      .write();

    return insertedRecords[0].id;
  }

  async runScript(id: string): Promise<void> {
    let record = this.dbService.db.get('records').find({id}).value();

    if (!record) {
      throw new ExpectedError('SCRIPT_RUNNING_RECORD_NOT_FOUND');
    }

    let resourcesBaseURL = `${this.config.webAdmin.url}/resources/${id}`;

    let runningResult = await this.agentService.runScript(record.namespace, {
      id: record.id,
      name: record.name,
      parameters: record.parameters,
      resourcesBaseURL,
    });

    let {parameters, deniedParameters, result, output} = runningResult;

    await this.dbService.db
      .get('records')
      .find({id})
      .assign({
        parameters,
        deniedParameters,
        result,
        output,
        ranAt: Date.now(),
      })
      .write();
  }
}

function convertRecordModelToRecord(
  recordModel: RunningRecordModel,
): RunningRecord {
  let {makeflow, ...rest} = recordModel;

  let convertedMakeflow: RunningRecordMakeflowInfo | undefined;

  if (makeflow) {
    let {powerItemToken, ...restMakeflow} = makeflow;

    convertedMakeflow = restMakeflow;
  }

  return {
    ...rest,
    makeflow: convertedMakeflow,
  };
}
