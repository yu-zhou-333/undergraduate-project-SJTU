from flask_caching import Cache


# Initialize Cache
cache = Cache(config={'CACHE_TYPE':'simple'})
