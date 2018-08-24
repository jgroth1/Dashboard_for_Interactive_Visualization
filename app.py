import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, render_template, jsonify

from flask_sqlalchemy import SQLAlchemy

######################################################################
# Flask Setup
######################################################################
app = Flask(__name__)

######################################################################
# Database Setup
######################################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/bellybutton.sqlite"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
Samples_Metadata = Base.classes.sample_metadata
Samples = Base.classes.samples

######################################################################
#
######################################################################
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/samples')
def samples():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query

    stmt = db.session.query(Samples).statement 
    df = pd.read_sql_query(stmt, db.session.bind) 
    # Return a list of the column names (sample names)
    return jsonify(list(df.columns)[2:])


@app.route('/metadata/<sample>') 
def metadata(sample):
    """Need a docstring"""

    meta = [
        Samples_Metadata.sample,
        Samples_Metadata.ETHNICITY,
        Samples_Metadata.GENDER,
        Samples_Metadata.AGE,
        Samples_Metadata.LOCATION,
        Samples_Metadata.BBTYPE,
        Samples_Metadata.WFREQ
        ]


    results = db.session.query(*meta).filter(Samples_Metadata.sample == sample).all()

    sample_metadata = {}
    for result in results:
        sample_metadata['samples'] = result[0]
        sample_metadata['ethnicity'] = result[1]
        sample_metadata['gender'] = result[2]
        sample_metadata['age'] = result[3]
        sample_metadata['location'] = result[4]
        sample_metadata['bbtype'] = result[5]
        sample_metadata['wfreq'] = result[6]

    return jsonify(sample_metadata)


@app.route("/sampledata/<sample>")
def sampledata(sample):
    """Return `otu_ids`, `otu_labels`,and `sample_values`."""
    state = db.session.query(Samples).statement
    data_DF = pd.read_sql_query(state, db.session.bind)
    
    sample_data = data_DF.loc[data_DF[sample] > 1, ["otu_id", "otu_label", sample]]

    data = {
        "otu_id": sample_data.loc[:,"otu_id"].values.tolist(),
        "otu_label": sample_data.loc[:,"otu_label"].values.tolist(),
        "sample_values": sample_data[sample].values.tolist()
    }
    return jsonify(data)


if __name__ == "__main__":
    app.run()
