import { useEffect, useReducer } from 'react';
import Error from './components/Error';
import FinishScreen from './components/FinishScreen';
import Footer from './components/Footer';
import Header from './components/Header';
import Loader from './components/Loader';
import Main from './components/Main';
import NextButton from './components/NextButton';
import Progress from './components/Progress';
import Question from './components/Question';
import StartScreen from './components/StartScreen';

const initialState = {
  questions: [],
  status: 'loading',
  index: 0,
  answer: null,
  points: 0,
  highscore: 0
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'DATA-RECEIVED':
      return { ...state, questions: action.payload, status: 'ready' };
    case 'DATA-FAILED':
      return { ...state, status: 'error' };
    case 'START':
      return { ...state, status: 'active' };
    case 'NEW-ANSWER':
      const question = state.questions[state.index];
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points
      };
    case 'NEW-QUESTION':
      return { ...state, index: state.index + 1, answer: null };
    case 'FINISH':
      return {
        ...state,
        status: 'finished',
        highscore:
          state.points > state.highscore ? state.points : state.highscore
      };
    case 'RESTART':
      return { ...initialState, questions: state.questions, status: 'ready' };
    default:
      throw new Error('Action unknown');
  }
};

export default function App() {
  const [{ questions, status, index, answer, points, highscore }, dispatch] =
    useReducer(reducer, initialState);

  const numQuestions = questions.length;

  const maxPossiblePoints = questions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );

  useEffect(() => {
    fetch(' http://localhost:9000/questions')
      .then((res) => res.json())
      .then((data) => dispatch({ type: 'DATA-RECEIVED', payload: data }))
      .catch((err) => dispatch({ type: 'DATA-FAILED' }));
  }, []);

  return (
    <div className='app'>
      <Header />
      <Main>
        {status === 'loading' && <Loader />}
        {status === 'error' && <Error />}
        {status === 'ready' && (
          <StartScreen
            numQuestions={numQuestions}
            dispatch={dispatch}
          />
        )}
        {status === 'active' && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <NextButton
                dispatch={dispatch}
                answer={answer}
                numQuestions={numQuestions}
                index={index}
              />
            </Footer>
          </>
        )}
        {status === 'finished' && (
          <FinishScreen
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
}
