export type ApiActionType = {
  type: string;
  payload?: {
    url: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    params?: any;
    query?: any;
    body?: any;
  };
  error?: any;
  clear?: boolean;
};

export type NonApiActionType = {
  type: string;
  payload?: any;
  error?: any;
  clear?: boolean;
};

export type ActionType = ApiActionType | NonApiActionType;
