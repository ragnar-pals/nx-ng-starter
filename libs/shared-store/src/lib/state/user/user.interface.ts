import { AppUser } from '@nx-ng-starter/shared-core/interfaces';
import { IActionPayload } from '@nx-ng-starter/shared-util';
import { Observable } from 'rxjs';

export class AppUserStateModel implements AppUser {
  public email = '';

  public admin = false;

  public token = '';

  constructor(input?: AppUserStateModel) {
    const keys = Boolean(input) ? Object.keys(input) : [];
    for (const key of keys) {
      this[key] = Boolean(input[key]) ? input[key] : this[key];
    }
  }
}

export interface IUserStatePayload {
  email?: string;
  admin?: boolean;
  token?: string;
}

export type TUserPayload = IActionPayload<IUserStatePayload>;

export interface IUserObservableOutput {
  model$: Observable<AppUserStateModel>;
  email$: Observable<string>;
  token$: Observable<string>;
  admin$: Observable<boolean>;
  isLoggedInSubscription$: Observable<boolean>;
}

export interface IUserHandlers {
  setState(payload: IUserStatePayload): void;
}
