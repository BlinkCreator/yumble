import {useHistory, Redirect} from 'react-router-dom';
import React, {useState, useEffect, useContext} from 'react';
import Help from '../Common/Help';
import {SocketContext} from './../../sockets/SocketContext';
import * as SocketEvents from './../../sockets';
import '../Common/Help.css';
import '../5.Lobby/Lobby.css';

const Lobby = (props) => {
  const socketContext = useContext(SocketContext);
  const [ShareButtonPopup, setSharePopup] = useState(false);
  const [helpButtonPopup, setHelpButtonPopup] = useState(false);
  const [users, setUsers] = useState(
    socketContext.users ? socketContext.users : []);
  const [redirect, setRedirect] = useState(false);
  const [cardData, setCardData] = useState(props.location.state);


  useEffect(() => {
    setUsers(socketContext.users ? socketContext.users : []);
  }, [socketContext]);

  useEffect(() => {
    document.title = 'Waiting Room';

    SocketEvents.setPreferences(socketContext.socket, (preferences) => {
      socketContext.setPreferences(preferences);
    });
    SocketEvents.newUser(socketContext.socket, (data) => {
      console.log(data);
      socketContext.setUsers(data.users);
    });
    SocketEvents.updateRestaurants(
        socketContext.socket,
        (data) => {
          console.log(data);
          if (data) {
            setCardData(data);
          }
        },
    );
    SocketEvents.countdown(socketContext.socket, (count) => {
      console.log(`${count} second countdown`);
      socketContext.setCountdown(count);
      startCountdown();
    });
  }, []);


  /**
   *
   */
  function startCountdown() {
    // go to next page
    setRedirect(true);
  }

  const history = useHistory();
  const goBack = () => {
    SocketEvents.leaveRoom(socketContext.socket);
    history.goBack();
  };

  const NumOfCusines = [];

  NumOfCusines.length == 0 ? NumOfCusines.push('Thai') : null;
  NumOfCusines.length > 0 ?

      (NumOfCusines.push(', ' + 'Burger'),
      NumOfCusines.push(', ' + 'European'),
      NumOfCusines.push(', ' + 'Mediterranean'),
      NumOfCusines.push(', ' + 'Chinese')) : null;


  let NumOfUsers = 0;
  NumOfUsers = users.length;

  const peopleList = () => {
    const peopleArray = [];
    const Food = 'Food';

    for (let i = 0; i < NumOfUsers; i++) {
      const FoodID = Food.concat(i.toString());
      peopleArray.push(
          <div className={FoodID} id='FoodIcon' key={i.toString()}>
            <text className='FoodIconText'>{users[i]}</text>
          </div>,
      );
    }
    return peopleArray;
  };


  return (
    <>
      <h1 className='Title'>yumble</h1>
      <div className='MakeCentre'>
        <div className='CusineTitle'>Cusines: {NumOfCusines}</div>
        <div className={'LobbyBox'}>
          <div>
            <div className='Inline_Block'>Group code: {socketContext.code}</div>
            <span className='CentreTitle'></span>
            <div className='Inline_Block'>{NumOfUsers}/10</div>
          </div>
          <div id='container'>{peopleList()}</div>
        </div>
        {socketContext.host && <button className='GoButton'
          onClick={
            () => SocketEvents.start(socketContext.socket, socketContext.code)
          }>
          Go
        </button>}
        {redirect && <Redirect to={{pathname: '/CountDown', state: cardData}}/>}
        <button onClick={() => setSharePopup(true)} className='ShareButton'>
          Share
        </button>
        <Help trigger={ShareButtonPopup} setTrigger={setSharePopup}>
          <div className='MakeTextCentre'>
            <h2> Share the group code:</h2>
            <h1>{socketContext.code}</h1>
            <a href={'https://yumble.xyz'}>
            https://yumble.xyz
            </a>
          </div>
        </Help>
        <button className='SmallBtn' id='BackButton'
          onClick={() => goBack()}>
            Back
        </button>
        <button
          onClick={() => setHelpButtonPopup(true)}
          className='SmallBtn'
          id='HelpButton'
        >
          help?
        </button>

        <Help trigger={helpButtonPopup} setTrigger={setHelpButtonPopup}>
          <p className='MakeTextCentre'>
            This is the lobby room, please wait a moment for the lobby to be
            filled.
          </p>
        </Help>
      </div>
    </>
  );
};

export default Lobby;
