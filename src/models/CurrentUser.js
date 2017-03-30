// @flow

import { observable, extendObservable, action, computed } from 'mobx';
import moment from 'moment';
import extend from 'lodash/extend';
import get from 'lodash/get';

import API from 'Utils/api';

type ResetAtHelperType = {
  formatted: ?string,
  seconds: number,
}

async function meta() {
  try {
    const { data } = await API.get('/meta');

    return Promise.resolve(data);
  } catch (e) {
    return Promise.reject();
  }
}

const formatTime = date => moment.utc(moment(date).diff(moment())).format('HH:mm:ss');
const formatSeconds = date => moment(date).diff(moment(), 'seconds');
const resetAtFormatted = (type: ?Date): string => (
  type && resetAtSeconds(type) > 0 ? formatTime(type) : ''
);
const resetAtSeconds = (type: ?Date): number => type ? formatSeconds(type) : -1;

const resetAtDateHelper = (data): ResetAtHelperType => ({
  formatted: resetAtFormatted(data),
  seconds: resetAtSeconds(data),
});

class CurrentUser {
  @observable is_fetched: boolean = false;
  @observable is_error: boolean = false;
  @observable like_limit_reset: ?number = null;
  @observable superlike_limit_reset: ?string = null;
  @observable superlike_remaining: ?number = null;
  @observable _id: string;
  @observable full_name: string;
  @observable photos: Object;

  @action set(json: Object) {
    if (json) {
      const { rating, user } = json;

      this.like_limit_reset = rating.rate_limited_until
      this.superlike_limit_reset = rating.super_likes.resets_at
      this.superlike_remaining = rating.super_likes.remaining

      extend(this, user);
    }
  }

  @action fetch() {
    meta().then(data => {
      // ReactGA.set({ userId: data.user._id })

      this.is_fetched = true;
    }).catch(e => {
      console.log(e);
      this.is_fetched = false;
      this.is_error = true;
    })
  }

  @computed get avatarUrl(): string {
    return get(this.photos, [0, 'url']);
  }

  @computed get likeResetDate(): ?Date {
    if (this.like_limit_reset) {
      return moment(this.like_limit_reset).format();
    }
  }

  @computed get superlikeResetDate(): ?Date {
    if (this.superlike_limit_reset) {
      return moment(this.superlike_limit_reset).format();
    }
  }

  @computed get likeReset(): ResetAtHelperType {
    return resetAtDateHelper(this.likeResetDate);
  }

  @computed get superlikeReset(): ResetAtHelperType {
    return resetAtDateHelper(this.superlikeResetDate);
  }
}

export default new CurrentUser();