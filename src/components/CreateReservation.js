import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DateTime from 'react-datetime';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

// Actions
import { addReservation, addError } from '../redux/actions/index';

// Reusable component
import SubmitButton from './SubmitButton';

// Api caller
import apiCaller from '../api/apiCaller';

const CreateReservation = ({
  loggedIn, roomID, addReservation, addError,
}) => {
  const useDate = () => {
    const [value, setValue] = useState('');

    const valid = current => current.isAfter(DateTime.moment());

    const handleChange = currentValue => {
      setValue(currentValue.format());
    };

    const date = (
      <DateTime
        onChange={handleChange}
        isValidDate={valid}
        inputProps={{ readOnly: true }}
      />
    );

    return [value, date];
  };

  const [waitingSubmit, setWaitingSubmit] = useState(false);
  const [fromDate, fromDateElement] = useDate();
  const [toDate, toDateElement] = useDate();

  if (!loggedIn) {
    return (
      <div className="create-reservation short">
        <Link to="/sign-in" className="reserve-link">Sign in to reserve.</Link>
      </div>
    );
  }

  const onSubmitClick = () => {
    if (waitingSubmit) return;

    const params = {
      start_time: fromDate,
      end_time: toDate,
      room_id: roomID,
    };

    const onSubmit = () => {
      setWaitingSubmit(true);
    };

    const onReady = (status, json) => {
      setWaitingSubmit(false);
      if (status === 201) {
        addReservation(json);
      }
    };

    const onError = error => { addError(error); };

    apiCaller({
      method: 'POST',
      endpoint: '/reservations',
      tokenNeeded: true,
      onError,
      onReady,
      onSubmit,
      params,
    });
  };

  return (
    <div className="create-reservation" id="create-reservation">
      <div className="text-container">
        <h3>Would like to reserve this room?</h3>
        <h4>Choose your time!</h4>
        <div className="input-container">
          <div className="start-datetime">
            <span>From:</span>
            { fromDateElement }
          </div>
          <div className="to-datetime">
            <span>To:</span>
            { toDateElement }
          </div>
        </div>
      </div>
      <SubmitButton handleSubmit={onSubmitClick} buttonText="Reserve" />
    </div>
  );
};

CreateReservation.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  roomID: PropTypes.number.isRequired,
  addReservation: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  loggedIn: state.user.loggedIn,
});

export default connect(mapStateToProps, { addReservation, addError })(CreateReservation);
