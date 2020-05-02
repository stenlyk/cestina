import React from "react";
import Start, { letters } from "./Start.js";
import Quiz from "./Quiz.js";
import { reactLocalStorage } from "reactjs-localstorage";
import CircleGraph from "./CircleGraph.js";
import linq from "linq";
export const version = "0.1";

export default class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: {
        letters: [],
        skils: { vyj: true, tvr: false },
      },
      submited: false,
      error: "",
      letters: letters,
      levels: {
        20: "green",
        50: "orange",
        200: "silver",
        500: "gold",
      },
      tab: "vyj",
      fixWrong: false,
    };
    this.runUpdateScript();
  }

  componentDidMount() {
    const selected = reactLocalStorage.getObject("selected", {});
    if (selected.skils) {
      this.setState({ selected });
    }
  }

  runUpdateScript() {
    let localVersion = reactLocalStorage.get("version", "0");
    if (localVersion !== version) {
    }
    reactLocalStorage.set("version", version);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    let selected = this.state.selected;
    if (name === "letter") {
      console.log(target);
      if (target.checked) {
        selected.letters.push(value);
      } else {
        var index = selected.letters.indexOf(target.value);
        if (index !== -1) {
          selected.letters.splice(index, 1);
        }
      }
    } else if (name === "all") {
      // console.log(target);
      // console.log(selected.num.length, nums.length);
      if (selected.letters.length === letters.length) {
        selected.letters = [];
      } else {
        selected.letters = letters;
      }
    } else {
      if (name === "vyj") {
        selected.skils["tvr"] = false;
        selected.letters = [];
      }
      if (name === "tvr") {
        selected.skils["vyj"] = false;
        selected.letters = [
          "H",
          "CH",
          "K",
          "R",
          "D",
          "T",
          "N",
          "Ž",
          "Š",
          "Č",
          "Ř",
          "C",
          "J",
          "Ď",
          "Ť",
          "Ň",
        ];
      }
      selected.skils[name] = target.checked;
    }

    if (selected.skils["vyj"] === false && selected.skils["tvr"] === false) {
      this.setState({
        error: "Zvol co chceš trénovat.",
      });
    } else {
      this.setState({
        error: "",
      });
    }
    this.setState({ selected });
    reactLocalStorage.setObject("selected", selected);
  }

  handleSubmit(event) {
    const selected = this.state.selected;

    if (selected.skils.vyj || selected.skils.tvr) {
      if (selected.letters.length > 0) {
        this.setState({
          submited: true,
          error: "",
          fixWrong: false,
        });
      } else {
        this.setState({
          error: "Vyber alespoň jedno písmeno na trénování. ",
        });
      }
    }

    event.preventDefault();
  }

  doublePoints(event) {
    this.setState({ submited: true, error: "", fixWrong: true });
    event.preventDefault();
  }

  leave(event) {
    this.setState({ submited: false, fixWrong: false });
    event.preventDefault();
  }

  switchTab(event) {
    this.setState({ tab: event.target.value });
  }

  streak(arr) {
    var i,
      temp,
      streak,
      length = arr.length,
      highestStreak = 0;

    for (i = 0; i < length; i++) {
      // check the value of the current entry against the last
      if (temp !== "" && temp === arr[i]) {
        // it's a match
        streak++;
      } else {
        // it's not a match, start streak from 1
        streak = 1;
      }

      // set current letter for next time
      temp = arr[i];

      // set the master streak var
      if (streak > highestStreak) {
        highestStreak = streak;
      }
    }

    return highestStreak;
  }

  renderStart() {
    const answeres = reactLocalStorage.getObject("answers", []);
    const wrong = linq
      .from(answeres)
      .where(function (x) {
        return x.isCorrect === false;
      })
      .count();
    const fixed = linq
      .from(answeres)
      .where(function (x) {
        return x.isCorrect === false && x.isFixed === true;
      })
      .count();

    const total = answeres.length;
    return (
      <Start
        onChange={(e) => this.handleChange(e)}
        onSubmit={(e) => this.handleSubmit(e)}
        doublePoints={(e) => this.doublePoints(e)}
        selected={this.state.selected}
        total={total}
        wrong={wrong}
        fixed={fixed}
      />
    );
  }

  renderQuiz() {
    return (
      <Quiz
        selected={this.state.selected}
        fixWrong={this.state.fixWrong}
        leave={(e) => this.leave(e)}
      />
    );
  }

  getLevel(points) {
    const levels = this.state.levels;
    const keys = Object.keys(levels);
    let result = ["green", 20];

    keys.forEach((key, index, elm) => {
      if (key < points) {
        result =
          index + 1 < keys.length
            ? [levels[elm[index + 1]], Number(elm[index + 1])]
            : [levels[key], Number(key)];
      }
    });
    return result;
  }

  renderStat(stats) {
    // console.log(stats);
    const tab = this.state.tab;
    let data = stats.vyj;

    const letters = this.state.letters;
    //console.log(this.getLevel(0));
    let level = {};
    let percent = 0;

    return (
      <>
        <div className="radio-bar">
          <input
            type="radio"
            name="tab"
            value="vyj"
            id="vyj"
            checked={tab === "vyj" ? true : false}
            onChange={(e) => this.switchTab(e)}
          />
          <label htmlFor="vyj">Vyjmenovaná slova</label>
          <input
            type="radio"
            name="tab"
            value="del"
            id="del"
            checked={tab === "del" ? true : false}
            onChange={(e) => this.switchTab(e)}
          />
          <label htmlFor="del">Tvrdé a měké souhlásky</label>
        </div>
        <div className="row">
          <div className="col">
            <div className="justify-content-between flex-wrap">
              {tab === "vyj" ? (
                <>
                  {letters.map((i) => {
                    level = this.getLevel(data[i]["correct"]);
                    percent = (data[i]["correct"] / level[1]) * 100;
                    return (
                      <div
                        className="graph"
                        key={i}
                        title={data[i]["correct"] + "/" + level[1]}
                      >
                        <CircleGraph percent={percent} label={i} />
                        <img
                          src={
                            process.env.PUBLIC_URL +
                            "/ic-" +
                            level[0] +
                            "-badge.svg"
                          }
                          alt={level[0]}
                        />
                      </div>
                    );
                  })}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </>
    );
  }

  renderStats() {
    const letters = this.state.letters;
    let answers = reactLocalStorage.getObject("answers", []);
    // console.log(answers);
    // const dataStreak = linq.from(answers).select("$.isCorrect").toArray();
    // let streak = this.streak(dataStreak);
    // console.log(dataStreak, streak);

    let data = linq
      .from(answers)
      .where(function (x) {
        return x.isCorrect === true || x.isFixed === true;
      })
      .groupBy(
        "{method: $.method, statsKey: $.statsKey}",
        null,
        "{ method: $.method, statsKey: $.statsKey, points: $$.sum('parseInt($.points)') }",
        "$.method + $.statsKey"
      )
      .toArray();

    let stats = {
      vyj: {},
    };

    letters.map((val) => {
      stats["vyj"][val] = { correct: 0, wrong: 0 };
      return null;
    });
    stats["tvr"] = [];
    stats["tvr"]["tvr"] = { correct: 0, wrong: 0 };

    // console.log(data);
    data.map(
      (elm) => (stats[elm.method][elm.statsKey]["correct"] = elm.points)
    );

    return (
      <>
        {this.renderStat(stats)}
        <hr />
        <div className="row legned info align-items-center">
          <div className="col-md-6 col-sm-12">
            <img
              src={process.env.PUBLIC_URL + "/ic-green-badge.svg"}
              alt="Zelenáč"
            />{" "}
            <span>Zelenáč</span>
          </div>
          <div className="col-md-6 col-sm-12">
            <img
              src={process.env.PUBLIC_URL + "/ic-orange-badge.svg"}
              alt="Chce to ještě trénink"
            />{" "}
            <span>Chce to ještě trénink</span>
          </div>
          <div className="col-md-6 col-sm-12">
            <img
              src={process.env.PUBLIC_URL + "/ic-silver-badge.svg"}
              alt="Už jen kousek k cíli"
            />{" "}
            <span>Už jen kousek k cíli</span>
          </div>
          <div className="col-md-6 col-sm-12">
            <img
              src={process.env.PUBLIC_URL + "/ic-gold-badge.svg"}
              alt="Počítáš na jedničku"
            />{" "}
            <span>Počítáš na jedničku</span>
          </div>
        </div>
      </>
    );
  }

  render() {
    const submited = this.state.submited;
    const error = this.state.error;
    return (
      <>
        {!submited ? (
          <div className="row">
            <div className="col-lg-6 col-sm-12">
              <div className="box">
                {error !== "" ? (
                  <div className="alert alert-danger">{error}</div>
                ) : (
                  ""
                )}
                {this.renderStart()}
              </div>
              <div className="row copy">
                <div className="col-6">
                  Made with{" "}
                  <span role="img" aria-label="love">
                    ❤️
                  </span>{" "}
                  by{" "}
                  <a href="https://www.facebook.com/stanislav.kurinec">
                    Standa
                  </a>
                </div>
                <div className="col-6">
                  Designed by <a href="https://zarzicky.cz">Lukáš</a>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-sm-12">
              <div className="box">
                <h4>Tvoje výsledky</h4>
                {this.renderStats()}
              </div>
            </div>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-md-5 col-sm-12">
              <a href="#leave" className="leave" onClick={(e) => this.leave(e)}>
                <img
                  src={process.env.PUBLIC_URL + "/ic-close.svg"}
                  alt="Odejít"
                />
                Odejít
              </a>
              <div className="box">{this.renderQuiz()}</div>
            </div>
          </div>
        )}
      </>
    );
  }
}
