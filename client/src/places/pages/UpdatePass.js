import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import "./PassForm.css";

const UpdatePass = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPass, setLoadedPass] = useState();
  const passId = useParams().passId;
  const navigate = useNavigate();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    const fetchPass = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/passwords/${passId}`
        );
        setLoadedPass(responseData.password);
        setFormData(
          {
            title: {
              value: responseData.password.title,
              isValid: true,
            },
            password: {
              value: responseData.password.password,
              isValid: true,
            },
          },
          true
        );
      } catch (err) {}
    };
    fetchPass();
  }, [sendRequest, passId, setFormData]);

  const passUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `http://localhost:5000/api/passwords/${passId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          password: formState.inputs.password.value,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
      navigate("/" + auth.userId + "/passwords");
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedPass && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find password!</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPass && (
        <form className="place-form" onSubmit={passUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title."
            onInput={inputHandler}
            initialValue={loadedPass.title}
            initialValid={true}
          />
          <Input
            id="password"
            element="input"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter a valid password (min. 6 characters)."
            onInput={inputHandler}
            initialValue={loadedPass.password}
            initialValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>
            EDIT PASSWORD
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdatePass;
