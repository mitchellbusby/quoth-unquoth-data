
import os
from flask import Flask, Blueprint, send_from_directory, send_file

app = Flask(
  __name__,
)


app.config['TEMPLATES_AUTO_RELOAD'] = True


## TODO: host API on API server

@app.route("/")
def index():
  return send_file("dist/index.html")

@app.route("/dist/<path:path>")
def dist(path):
  return send_from_directory("dist", path)


api = Blueprint('api', __name__, url_prefix='/api')


@api.route("/")
def api_index():
  return "all's good api cap'n"


app.register_blueprint(api)

if __name__ == "__main__":
  app.run(
    '0.0.0.0',
    debug=True,
    port=int(os.environ.get('PORT', 5001))
  )