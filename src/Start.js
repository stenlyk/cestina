import React from "react";

export const letters = ["B", "L", "M", "P", "S", "V", "Z"];

export default class Start extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      letters: letters,
      skils: {
        tvr: "Tvrdé a měké souhlásky",
        vyj: "Vyjmenovaná slova",
      },
    };
  }

  renderLetter(letter) {
    const checked = this.props.selected.letters.indexOf(letter);
    return (
      <React.Fragment key={letter}>
        <input
          type="checkbox"
          name="letter"
          value={letter}
          checked={checked !== -1 ? true : false}
          id={"input" + letter}
          onChange={this.props.onChange}
        />
        <label className="checkbox" htmlFor={"input" + letter}>
          {letter}
        </label>
      </React.Fragment>
    );
  }

  renderSkils(val, key) {
    // console.log(this.props.selected.skils[key] === true);
    return (
      <React.Fragment key={key}>
        <input
          type="checkbox"
          name={key}
          value={true}
          checked={this.props.selected.skils[key] === true ? true : false}
          id={"input" + key}
          onChange={this.props.onChange}
        />
        <label className="checkbox" htmlFor={"input" + key}>
          {val}
        </label>
      </React.Fragment>
    );
  }

  render() {
    return (
      <div className="start">
        <form onSubmit={this.props.onSubmit}>
          <h4>Co chceš trénovat?</h4>
          <div className="justify-content-between">
            {Object.keys(this.state.skils).map((key) =>
              this.renderSkils(this.state.skils[key], key)
            )}
          </div>
          {this.props.selected.skils["vyj"] === true ? (
            <>
              <h4>S jaká vyjmenovaná slova chceš trénovat?</h4>
              <div className="numbers justify-content-between">
                <input
                  type="checkbox"
                  value={true}
                  name="all"
                  checked={
                    this.props.selected.letters.length ===
                    this.state.letters.length
                      ? true
                      : false
                  }
                  onChange={this.props.onChange}
                  id="inputAll"
                />
                <label className="checkbox all" htmlFor={"inputAll"}>
                  Vše
                </label>
                {this.state.letters.map((num) => this.renderLetter(num))}
              </div>
            </>
          ) : null}
          <hr />
          <div className="row align-items-center">
            <div className="col light-text">
              {this.props.total} dokončených příkladů
            </div>
            <div className="col text-right">
              <button type="submit" className="btn">
                <img
                  src={process.env.PUBLIC_URL + "/ic-next-white.svg"}
                  alt="start"
                />{" "}
                Trénovat
              </button>
            </div>
          </div>
          {this.props.wrong >= 10 ? (
            <>
              <hr className="m-top" />
              <div className="row align-items-center">
                <div className="col-6 light-text">
                  {this.props.wrong} chyb
                  <br />
                  {this.props.fixed} opraveno
                </div>
                <div className="col-6 text-right">
                  <button
                    type="button"
                    onClick={this.props.doublePoints}
                    className="btn btn-scondary"
                  >
                    <img
                      src={process.env.PUBLIC_URL + "/ic-next.svg"}
                      alt="start"
                    />{" "}
                    Opravit si chyby
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </form>
      </div>
    );
  }
}
