import React from "react";

import Card from "../../shared/components/UIElements/Card";
import PassItem from "./PassItem";
import Button from "../../shared/components/FormElements/Button";
import "./PassList.css";

const PassList = (props) => {
  if (props.items.length === 0) {
    return (
      <div className="place-list center">
        <Card>
          <h2>No passwords found. Maybe save one?</h2>
          <Button to="/passwords/new">Save Password</Button>
        </Card>
      </div>
    );
  }

  return (
    <ul className="place-list">
      {props.items.map((pass) => (
        <PassItem
          key={pass.id}
          id={pass.id}
          title={pass.title}
          password={pass.password}
          ownerId={pass.owner}
          onDelete={props.onDeletePlace}
        />
      ))}
    </ul>
  );
};

export default PassList;
