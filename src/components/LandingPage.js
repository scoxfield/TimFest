// src/components/LandingPage.js
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import './LandingPage.css';

const LandingPage = ({ history }) => {
  const [partiesCount, setPartiesCount] = useState(0);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [show, setShow] = useState(true);

  const countUp = (setCount, target) => {
    let start = 0;
    const duration = 5000;
    const totalSteps = target;
    const intervalTime = duration / totalSteps;

    const timer = setInterval(() => {
      if (start < target) {
        start += 1;
        setCount(start);

        if (target - start <= Math.ceil(target * 0.2)) {
          clearInterval(timer);
          const slowDownDuration = intervalTime * 7;
          const slowTimer = setInterval(() => {
            if (start < target) {
              start += 1;
              setCount(start);
            } else {
              clearInterval(slowTimer);
            }
          }, slowDownDuration);
        }
      } else {
        clearInterval(timer);
      }
    }, intervalTime);
  };

  useEffect(() => {
    countUp(setPartiesCount, 68);
    countUp(setParticipantsCount, 412);
  }, []);

  const handleLoginClick = () => {
    setShow(false);
    setTimeout(() => {
      history.push('/login');
    }, 300); // Așteaptă animația să termine
  };

  return (
    <CSSTransition
      in={show}
      timeout={300}
      classNames="slide"
      unmountOnExit
    >
      <div className="landing-container">
        <header className="mb-4">
          <h1 className="display-4">TimFest</h1>
          <p className="lead">Planifică petrecerea perfectă!</p>
        </header>
        <main>
          <section>
            <h2>Bine ai venit!</h2>
            <p className="mb-4">
              TimFest te ajută să organizezi evenimente minunate cu colegii și prietenii. 
              Indiferent dacă este o petrecere mică sau un eveniment mare, suntem aici să te ajutăm!
            </p>
            <div className="counters">
              <div className="counter">
                <h3>Am organizat {partiesCount} petreceri cu succes</h3>
              </div>
              <div className="counter">
                <h3>Au participat {participantsCount} persoane</h3>
              </div>
            </div>
            <button className="landing-button" onClick={handleLoginClick}>
              Autentificare
            </button>
          </section>
        </main>
      </div>
    </CSSTransition>
  );
};

export default withRouter(LandingPage);
