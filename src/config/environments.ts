import * as joi from 'joi';
import 'dotenv/config';

interface EnvironmentsVariables {
  NATS_SERVER: string;
}

const environmentsSchema = joi
  .object({
    NATS_SERVER: joi.string().required(),
  })
  .unknown();

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { error, value } = environmentsSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const environmentVariables: EnvironmentsVariables = value;

export const environments = {
  natsServer: environmentVariables.NATS_SERVER,
};
