import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const EventStoreContext = createContext({
  events: null,
  initializeEvents: () => {},
  setEvents: () => {},
});

export function EventStoreProvider({ children }) {
  const [events, setEvents] = useState(null);
  const initializeEvents = useCallback((initialEvents) => {
    setEvents((currentEvents) => currentEvents ?? initialEvents);
  }, []);
  const value = useMemo(
    () => ({ events, initializeEvents, setEvents }),
    [events, initializeEvents],
  );

  return (
    <EventStoreContext.Provider value={value}>
      {children}
    </EventStoreContext.Provider>
  );
}

export function useEventStore() {
  return useContext(EventStoreContext);
}
