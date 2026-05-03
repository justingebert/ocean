/**
 * Defines the properties required for user authentication.
 */
export interface CredentialProperties {
  username: string;
  password: string;
}
/**
 * Defines the base properties required for all models.
 */
export interface BaseModelProps {
  readonly id: number;
}
/**
 * Abstract base class for all models.
 * Ensures that each model has a unique `id` property.
 */
export abstract class BaseModel {
  public readonly id: number;
  /**
   * Initializes a new instance of a model.
   * @param props - The base properties containing the `id`.
   */
  constructor(props: BaseModelProps) {
    this.id = props.id;
  }
}
