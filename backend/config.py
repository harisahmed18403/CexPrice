import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'error'

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db3')
    
    CEX_COUNTRY_CODE = 'uk'
    CEX_ALGOLIA_API_KEY = 'bf79f2b6699e60a18ae330a1248b452c'
    CEX_ALGOLIA_APP_ID = 'LNNFEEWZVA'