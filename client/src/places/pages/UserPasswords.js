import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PassList from "../components/PassList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

const UserPasswords = () => {
  const [loadedPasswords, setLoadedPasswords] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const userId = useParams().userId;

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/passwords/user/${userId}`
        );
        setLoadedPasswords(responseData.passwords);
      } catch (err) {}
    };
    fetchPasswords();
  }, [sendRequest, userId]);

  const passwordDeletedHandler = (deletedPasswordId) => {
    setLoadedPasswords((prevPasswords) =>
      prevPasswords.filter((password) => password.id !== deletedPasswordId)
    );
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPasswords && (
        <PassList
          items={loadedPasswords}
          onDeletePlace={passwordDeletedHandler}
        />
      )}
    </React.Fragment>
  );
};

export default UserPasswords;
