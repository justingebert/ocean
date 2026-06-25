export interface CredentialProperties {
  username: string;
  password: string;
}

export interface BaseModelProps {
  readonly id: number;
}

export abstract class BaseModel {
  public readonly id: number;

  constructor(props: BaseModelProps) {
    this.id = props.id;
  }
}
