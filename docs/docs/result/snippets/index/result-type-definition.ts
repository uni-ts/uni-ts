type Result<Data, Error> =
  | { success: true; data: Data }
  | { success: false; error: Error };
