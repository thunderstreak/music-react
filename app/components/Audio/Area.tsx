import React from 'react';
import indexPortalRedSemi from '../../assets/images/index-portal-red-semi.svg';
import indexPortalRed from '../../assets/images/index-portal-red.svg';
import indexPortalOrange from '../../assets/images/index-portal-orange.svg';

import indexPortalYellowSemi from '../../assets/images/index-portal-yellow-semi.svg';
import indexPortalYellow from '../../assets/images/index-portal-yellow.svg';
import indexPortalGreenSemi from '../../assets/images/index-portal-green-semi.svg';
import indexPortalGreen from '../../assets/images/index-portal-green.svg';
import indexPortalBlueSemi from '../../assets/images/index-portal-blue-semi.svg';
import indexPortalBlue from '../../assets/images/index-portal-blue.svg';

export default function AudioArea(): JSX.Element {
  return (
    <div className="hero-logo" aria-hidden="true">
      <div className="hero-logo-circles">
        <img
          draggable="false"
          className="hero-logo-circle"
          src={indexPortalRedSemi}
          alt=""
        />
        <img
          draggable="false"
          className="hero-logo-circle"
          src={indexPortalRed}
          alt=""
        />
        <img
          draggable="false"
          className="hero-logo-circle"
          src={indexPortalOrange}
          alt=""
        />
        <img
          draggable="false"
          className="hero-logo-circle"
          src={indexPortalOrange}
          alt=""
        />
        <img
          draggable="false"
          className="hero-logo-circle"
          src={indexPortalYellowSemi}
          alt=""
        />
        <img
          draggable="false"
          className="hero-logo-circle"
          src={indexPortalYellow}
          alt=""
        />
        <img
          draggable="false"
          className="hero-logo-circle"
          src={indexPortalGreenSemi}
          alt=""
        />
        <img
          draggable="false"
          className="hero-logo-circle"
          src={indexPortalGreen}
          alt=""
        />
        <img
          draggable="false"
          className="hero-logo-circle"
          src={indexPortalBlueSemi}
          alt=""
        />
        <img
          draggable="false"
          className="hero-logo-circle"
          src={indexPortalBlue}
          alt=""
        />
      </div>
    </div>
  );
}
