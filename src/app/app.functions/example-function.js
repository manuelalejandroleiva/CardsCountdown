exports.main = async (context = {}) => {
  const { hs_object_id } = context.propertiesToSend;
  const { text } = context.parameters;

  const response = `This is coming from a serverless function! You entered: ${text}`;

  return response;
};
