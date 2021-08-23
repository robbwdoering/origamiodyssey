/**
 * FILENAME: useApi.js
 *
 * DESCRIPTION: Helper hook that manages a connection to the authenticated REST API that backs the app.
 * src: https://github.com/auth0/auth0-react/blob/master/EXAMPLES.md#4-create-a-useapi-hook-for-accessing-protected-apis-with-an-access-token
 * @param path JUST THE PATH, not the full URL, of the requested resource
 * @param options object defining audience, scope, and any custom inputs
 */
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const useApi = (url, method, options = {}, handleFetch, data) => {
    const { getAccessTokenSilently, user, isAuthenticated } = useAuth0();
    const [state, setState] = useState({
        error: null,
        loading: false,
        data: null
    });

    const sleep = ms => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const perform = async (urlSuffix, overrideValues, overrideMethod) => {
        let count = 20;
        while ((!isAuthenticated) && count > 0) {
            count--;
            await sleep(1000);
        }

        try {
            const accessToken = await getAccessTokenSilently(options);

            let msg = {
                method: overrideMethod || method,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    // Authorization: `Bearer ${accessToken}`,
                    strategy: 'auth0',
                    access_token: accessToken
                }
            };

            // Append data if it was passed
            if (overrideValues) {
                msg.body = JSON.stringify(overrideValues);
            } else if (data && method !== "GET") {
                msg.body = JSON.stringify(data);
            }
            setState(Object.assign({}, state, { loading: true }))

            // Perform the fetch asynchrounously
            fetch(process.env.REACT_APP_API_IP + url + (urlSuffix || ""), msg)
            .then(response => {
                if (!response.ok) {
                    console.error('[useApi] Received a bad status from the server: ', response);
                    throw new Error(`status ${response.status}`);
                }
                return response.json();
            })
            .then((json) => {
                // This line handles all responses - created at app root to hook into redux
                if (handleFetch) {
                    handleFetch(json);
                }

                setState(Object.assign({}, state, {data: json}))

                // Turn off loading indicator
                setState(Object.assign({}, state, { loading: false }));
            })
            .catch(e => {
                console.log('call failed', e);
            });
        } catch (error) {
            console.log('useApi FAILURE from exception: ', error);
            setState({
                ...state,
                error,
                loading: false
            });
        }
    };

    return {
    ...state,
    refresh: perform
    };
};
