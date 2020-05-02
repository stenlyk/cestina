import React from "react";
import { reactLocalStorage } from "reactjs-localstorage";
import linq from "linq";
import { wordsObojetne } from "./words/obojetne.js";
import { tvrde } from "./words/tvrde.js";

export default class Quiz extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  get initialState() {
    return {
      questions: {},
      wrong: {},
      position: 0,
      answers: [],
      submited: false,
      correctAnswer: "",
      correctAnswerState: "success",
      done: false,
    };
  }

  componentDidMount() {
    if (this.props.fixWrong) {
      this.generateQuestionsFromWrong();
    } else {
      this.generateQuestions();
    }
  }

  reload(event) {
    this.setState(this.initialState);
    setTimeout(() => {
      this.generateQuestions();
    }, 100);
    event.preventDefault();
  }

  setAnswer(event) {
    const position = this.state.position;
    let answers = this.state.answers;

    answers[position] = event.target.value;
    this.setState({ answers });
  }

  handleSubmit(event) {
    const state = this.state;
    const questions = state.questions;
    let wrong = state.wrong;
    let answers = state.answers;
    const position = state.position;

    console.log(Object.keys(questions).length, position);
    if (Object.keys(questions).length > position) {
      const key = Object.keys(questions)[position];
      const q = questions[key];
      const parts = q.word.split("_");
      let timeout = 2000;
      this.setState({
        submited: true,
      });
      let lsAnswers = reactLocalStorage.getObject("answers", []);

      q.date = new Date().toISOString().slice(0, 10);
      const id = new Date().valueOf();

      if (this.evaluate(q, answers[position])) {
        // FixWrong update old example
        if (this.props.fixWrong) {
          lsAnswers = lsAnswers.map((a) => {
            return a.id === q.id && a.isCorrect === false
              ? { ...a, isFixed: true, points: 1 }
              : a;
          });
        }

        q.points = 1;
        q.id = id;
        q.isCorrect = true;
        lsAnswers.push(q);

        this.setState({
          correctAnswer: (
            <div>
              {parts[0]}
              <span className="bg-success">{q.answer}</span>
              {parts[1]}
            </div>
          ),
        });
        timeout = 800;
      } else {
        q.points = 0;
        q.id = id;
        q.isCorrect = false;
        lsAnswers.push(q);

        wrong[key] = q;

        this.setState({
          correctAnswer: (
            <div>
              {parts[0]}
              <span className="bg-danger">{answers[position]}</span>
              {parts[1]}
            </div>
          ),
        });
      }

      reactLocalStorage.setObject("answers", lsAnswers);

      setTimeout(
        () =>
          this.setState({
            position: position + 1,
            submited: false,
          }),
        timeout
      );
    }
    if (Object.keys(questions).length === position + 1) {
      this.setState({ done: true });
      console.log(Object.keys(questions).length, position);
    }

    event.preventDefault();
  }

  evaluate(question, answer) {
    console.log(answer);
    return question.answer === answer;
  }

  setDone(event, victory) {
    const questions = this.state.questions;
    if (victory) {
      this.setState({
        done: true,
        answers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        position: 10,
      });
    } else {
      this.setState({
        done: true,
        answers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        position: 10,
        wrong: Object.entries(questions)
          .slice(0, 4)
          .map((entry) => entry[1]),
      });
    }
    event.preventDefault();
  }

  generateQuestions() {
    for (let index = 0; index < 10; index++) {
      this.generateQuestion();
    }
  }

  randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  generateQuestion() {
    const letters = this.props.selected.letters;
    const skils = this.props.selected.skils;

    let usedQuestions = this.state.questions;
    let words = wordsObojetne;

    let letter = "";
    let word = "";
    let options = [];
    let answer = "";
    let method = "vyj";
    let statsKey = false;

    if (skils.tvr === true) {
      words = tvrde;
      method = "tvr";
    }
    if (Object.keys(usedQuestions).length < 10) {
      if (skils.vyj === true || skils.tvr === true) {
        letter = letters[Math.floor(Math.random() * letters.length)];

        let regLetter =
          "(" +
          letter +
          "y|" +
          letter.toLowerCase() +
          "y|" +
          letter +
          "ý|" +
          letter.toLowerCase() +
          "ý|" +
          letter +
          "i|" +
          letter.toLowerCase() +
          "i|" +
          letter +
          "í|" +
          letter.toLowerCase() +
          "í)";
        let reg = new RegExp("(.*)" + regLetter + "(.*)");

        let wordsFromLetter = linq
          .from(words)
          .where(function (x) {
            return reg.test(x) === true;
          })
          .shuffle()
          .toArray();

        word =
          wordsFromLetter[Math.floor(Math.random() * wordsFromLetter.length)];

        let parts = reg.exec(word);
        console.log(parts, letter, word);

        let reg2 = new RegExp(regLetter);
        options = ["i", "y"];

        if (parts === undefined || parts === null) {
          this.generateQuestion();
          return false;
        }
        for (let index = 1; index < parts.length; index++) {
          let result = reg2.exec(parts[index]);
          //console.log(result);
          if (result && result[0] === parts[index]) {
            answer = parts[index].substr(1);
            if (letter === "CH") {
              answer = parts[index].substr(2);
            }

            if (answer === "ý" || answer === "í") {
              options = ["í", "ý"];
            }
            word = parts[1] + parts[2].substr(0, 1) + "_" + parts[3];
            if (letter === "CH") {
              word = parts[1] + parts[2].substr(0, 2) + "_" + parts[3];
            }

            console.log(parts);
            if (parts[3] === "") {
              console.log("new");
              this.generateQuestion();
            }
          }
        }

        statsKey = letter;
        if (skils.tvr === true) {
          statsKey = "tvr";
        }
      }

      const key = method + "|" + letter + "|" + word;
      if (usedQuestions[key]) {
        this.generateQuestion();
      }
      usedQuestions[key] = {
        letter,
        word,
        method,
        options,
        answer,
        statsKey,
      };

      this.setState((state) => ({
        ...state,
        questions: usedQuestions,
      }));
    }
  }

  notFixed(obj) {
    return obj.fixed === undefined;
  }

  generateQuestionsFromWrong() {
    let usedQuestions = this.state.questions;

    let lsWrong = reactLocalStorage.getObject("answers", []);
    lsWrong = linq
      .from(lsWrong)
      .where(function (x) {
        return x.isCorrect === false || x.isFixed === false;
      })
      .shuffle()
      .toArray();

    for (let index = 0; index < 10; index++) {
      usedQuestions[index] = lsWrong[index];
    }
    this.setState((state) => ({
      ...state,
      questions: usedQuestions,
    }));
  }

  renderQuestion() {
    const position = this.state.position;
    const questions = this.state.questions;
    // console.log(questions);
    const q = questions[Object.keys(questions)[position]];
    const submited = this.state.submited;
    const correctAnswer = this.state.correctAnswer;

    return (
      <>
        <div className="row question justify-content-center align-items-center">
          <div className="col">
            {!submited ? (
              this.renderMethod(q)
            ) : (
              <h2 className={this.getH2Size(correctAnswer.toString())}>
                {correctAnswer}
              </h2>
            )}
          </div>
        </div>
      </>
    );
  }

  renderMethod(q) {
    return (
      <>
        <h2 className={this.getH2Size(q.word)}>{q.word}</h2>
        <div className="row justify-content-around answerOptions">
          {q.options.map((op) => (
            <button
              key={op}
              type="submit"
              name="answer"
              value={op}
              className="button"
              onClick={(e) => this.setAnswer(e)}
            >
              {op}
            </button>
          ))}
        </div>
      </>
    );
  }

  getH2Size(word) {
    const l = word.length;
    let size = "normal";
    if (l > 15) {
      size = "small-1";
    }
    if (l > 30) {
      size = "small-2";
    }
    if (l > 60) {
      size = "small-3";
    }
    return size;
  }

  renderViewMethod(q) {
    const parts = q.word.split("_");
    console.log(q);
    return (
      <h2>
        {parts[0]}
        <span className="bg-danger">{q.answer}</span>
        {parts[1]}
      </h2>
    );
  }

  renderWrong(wrong) {
    const items = Object.keys(wrong);
    return items.map((key) => {
      const w = wrong[key];
      return (
        <div className="col-6" key={key}>
          {this.renderViewMethod(w)}
        </div>
      );
    });
  }

  renderSummary() {
    const questions = this.state.questions;
    const wrong = this.state.wrong;

    const countQ = Object.keys(questions).length;
    const countW = Object.keys(wrong).length;

    const titles = [
      "Excelentně!",
      "Výborně.",
      "Skvěle.",
      "Dobrá práce.",
      "Ještě to chce zlepšit.",
      "Trénink dělá mistra.",
      "Nevěš hlavu a trénuj.",
      "Zkus to znova a lépe.",
      "Zkus to znova a lépe.",
      "Tak to se nepovedlo.",
      "Trénuj, trénuj, trénuj!",
    ];

    return (
      <>
        <h4 className="text-center quizHeader">{titles[countW]}</h4>
        <h5 className="text-center quizHeader">Koukni, jak ti to šlo.</h5>
        <div className="row quiz justify-content-around">
          <div className="col">
            <div className="badge success">
              <img
                src={process.env.PUBLIC_URL + "/ic-good-badge.svg"}
                alt="x"
              />
              <span>{countQ - countW}</span>
              <h4>Správně</h4>
            </div>
          </div>
          {countW !== 0 ? (
            <div className="col">
              <div className="badge danger">
                <img
                  src={process.env.PUBLIC_URL + "/ic-wrong-badge.svg"}
                  alt="x"
                />
                <span>{countW}</span>
                <h4>Chybně</h4>
              </div>
            </div>
          ) : null}
        </div>
        {countW > 0 ? (
          <>
            <hr />
            <div className="row quiz">
              <div className="col">
                <h4>Pojď, projdeme tvé chybné odpovědi</h4>
                <div className="row resume">{this.renderWrong(wrong)}</div>
              </div>
            </div>
          </>
        ) : null}
        <hr />
        <div className="row quiz">
          <div className="col text-right">
            <button
              className="btn btn-primary btn-lg"
              onClick={(e) => this.reload(e)}
            >
              Začít znovu
            </button>
          </div>
        </div>
      </>
    );
  }

  render() {
    const total = Object.keys(this.state.questions);
    const wrong = this.state.wrong;
    const position = this.state.position;
    const done = this.state.done;
    // console.log(this.state.questions);
    if (total.length === 0) {
      return null;
    }

    return (
      <>
        <div>
          {done ? (
            this.renderSummary()
          ) : (
            <>
              <div className="progress justify-content-between">
                {total.map((key, i) => {
                  let status = "";
                  if (i < position) {
                    status = wrong[key] ? "danger" : "success";
                  }
                  if (i === position) {
                    status = "current";
                  }

                  return <div key={i} className={status + " bullet"}></div>;
                })}
              </div>
              <form onSubmit={(e) => this.handleSubmit(e)} autoComplete="off">
                {this.renderQuestion()}
              </form>
            </>
          )}
        </div>
      </>
    );
  }
}
