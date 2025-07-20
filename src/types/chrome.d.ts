declare namespace chrome {
  namespace runtime {
    function sendMessage(
      extensionId: string,
      message: any,
      callback?: (response: any) => void
    ): Promise<any>;
  }
}
