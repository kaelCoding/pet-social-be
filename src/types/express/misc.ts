import * as e from 'express';



// **** Express **** //

export interface IReq<T = void> extends e.Request {
  body: T;
}

/*
export interface IRes extends e.Response {
  locals: {
    sessionUser?: string // must be delete
  };
}*/


export interface IRes<T = any> extends e.Response {
  locals: {
    sessionUser?: string; // must be delete
  };
  json: <U extends T>(body: U) => this;
}

/*
export interface IRes<T = void> extends e.Response {
  locals: {
    sessionUser?: string; // must be delete
  };
  json: (body: T) => IRes<T>;
}*/

