// @flow

import './PersonCard.scss';

import React from 'react';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { compose, withHandlers, withState, pure, withProps } from 'recompose';
import cx from 'classnames';

import Gallery from 'Components/Gallery';
import ActionButtons from 'Components/ActionButtons';

import withHotkeys from 'hoc/withHotkeys';
import { ACTION_TYPES } from 'const';

import type { PersonType, ActionsType } from 'types/person';

const keyCodes = { d: 68, s: 83, a: 65 };

const callAction = (props, actionType: ActionsType) =>
  props.person.callAction(actionType, props.onSuperlike, props.onMatch, props.onError);

const enhance = compose(
  withState('isHovering', 'toggleHover', false),
  withHotkeys({
    [keyCodes.d]: props => {
      callAction(props, ACTION_TYPES.LIKE);
    },
    [keyCodes.s]: props => {
      callAction(props, ACTION_TYPES.SUPERLIKE);
    },
    [keyCodes.a]: props => {
      callAction(props, ACTION_TYPES.PASS);
    },
  }),
  withHandlers({
    onActionClick: props => (actionType: ActionsType) => {
      callAction(props, actionType);
    },
    onCardMouseEnter: ({ toggleHover }) => () => toggleHover(true),
    onCardMouseLeave: ({ toggleHover }) => () => toggleHover(false),
  }),
  pure,
);

const renderInstagramLink = (link, name, small) => (
  <a href={link} target="_blank" title={name}>
    <i className="fa fa-instagram" />
    {!small && <div className="instaname">{name}</div>}
  </a>
);

type PersonCardType = {
  person: PersonType,
  small?: boolean,
  allowHotkeys?: boolean,
  isHovering: boolean,
  onCardMouseEnter: Function,
  onCardMouseLeave: Function,
  onActionClick: (type: ActionsType) => void,
  onError: (reason: ActionsType) => void,
  limitations: {
    superlikeRemaining: number,
    superlikeResetsAt: ?string,
    likeResetsAt: ?string,
  }
};

const PersonCard = ({
  person, small, onActionClick, onCardMouseEnter, onCardMouseLeave, isHovering,
  limitations: { superlikeRemaining, superlikeResetsAt, likeResetsAt },
}: PersonCardType) => {
  const shouldShowActionButtons = !small || (small && isHovering);

  return (
    <div
      className={cx('person-card', { 'person-card--large': !small })}
      onMouseEnter={onCardMouseEnter}
      onMouseLeave={onCardMouseLeave}
    >
      <div className="person-card__gallery">
        <Gallery
          scrolling={!small}
          images={person.photos}
          width={small ? 220 : 400}
        />
      </div>
      <div className="person-card__content">
        <div className="person-card__name">
          <Link to={`/user/${person.id}`}>{person.name}, {person.age}</Link>
        </div>
        <div className="person-card__seen-min">{person.seenMin}</div>
        <div className="person-card__bio">{person.bio}</div>

        {!small && <div className="person-card__school">
          <span>{person.school}</span>
        </div>}
        <div className="person-card__employ">
          <span>{person.school}</span>
          {shouldShowActionButtons && <div className="person-card__employ__actions">
            <ActionButtons
              liked={person.is_liked}
              likeResetsAt={likeResetsAt}
              superLikeResetsAt={superlikeResetsAt}
              superlikeRemaining={superlikeRemaining}
              onButtonClick={onActionClick}
              hideTimer={small}
              size={small ? 'small' : 'large'}
            />
          </div>}
        </div>

        <div className="person-card__footer">
          <div className="person-card__footer--distance">{person.distanceKm}</div>
          <div className="person-card__footer--instagram">
            {
              person.instagramProfileLink ?
              renderInstagramLink(person.instagramProfileLink, person.instagramUsername, small) :
              <i className="fa fa-instagram" />
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default enhance(observer(PersonCard));