let get  = require('../get');

export default function handler(request, response) {
  const { name = 'World' } = request.query;
  response.send(`Hello ${name}!`);  
}
