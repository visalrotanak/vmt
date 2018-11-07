import React from 'react';
import classes from './room.css';
import Button from '../../Components/UI/Button/Button';
import { withRouter } from 'react-router-dom';
const summary = ({room, history, loading}) => {
  
  const goToWorkspace = () => {
    history.push(`/myVMT/workspace/${room._id}`);
  }
  const goToReplayer = () => {
    if (room.events.length > 0) {
      history.push(`/myVMT/workspace/${room._id}/replayer`)
    } else {
      // SOME SORT OF ERROR MESSAGE
    }
  }
  return (
    <div className={classes.Container}>
      <div className={classes.Section}>
        <div>
          {/*CONSIDER: COULD REPLACE THESE 0'S WITH LOADING SPINNERS? */}
          <div>Current Members: {room.currentUsers ? room.currentUsers.length : 0}</div>
          <div>Total Events: {room.events ? room.events.length : 0}</div>
          <div>Total Messages: {room.chat ? room.chat.length : 0}</div>
        </div>
      </div>
      <div className={classes.Section}>
        {/* <div>Events: </div>{room.events ? room.events.length : 0} */}
      </div>
      {/*  Make sure we have all of the room info before letting the user enter */}
      {loading ? null :
      <div className={classes.Section}>
        <span className={classes.Button}><Button m={5} click={goToWorkspace}>Join</Button></span>
        <span className={classes.Button}><Button m={5} click={goToReplayer}>Replayer</Button></span>
      </div>
      }
    </div>
  )
}

export default withRouter(summary);