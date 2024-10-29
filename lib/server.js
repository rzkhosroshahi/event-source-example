import http from 'http';

class App {
  constructor() {
    this.routes = { GET: [], POST: [] };
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  get(path, handler) {
    this.routes.GET.push({ path, handler });
  }

  post(path, handler) {
    this.routes.POST.push({ path, handler });
  }

  async handleRequest(req, res) {
    for (let middleware of this.middlewares) {
      const handled = await middleware(req, res);
      if (handled) return;
    }

    const method = req.method;
    const url = req.url;
    const route = this.routes[method].find(r => r.path === url);

    if (route) {
      route.handler(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }

  listen(port, callback) {
    const server = http.createServer(this.handleRequest.bind(this));
    server.listen(port, callback);
  }
}

export default () => new App();
