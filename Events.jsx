import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from './AppHeader';
import { useAuth } from './AuthContext';
import { useEventStore } from './EventStoreContext';
import { useAppTheme } from './ThemeContext';
import UserEventCurve from './assets/curva1.svg';
import EventsCurve from './assets/curva_eventi.svg';
import UsersIcon from './assets/users.svg';

const BLUE = '#2F59AE';
const DARK_BLUE = '#283F70';
const YELLOW = '#F5C330';
const PAGE_BACKGROUND = '#DEDEDE';
const ABSENT_VOTE = 'absent';

const EVENT_GAMES = [
  {
    key: 'yugioh',
    name: 'Yu-Gi-Oh!',
    image: require('./assets/copertine_giochi/yugioh.png'),
    cardIcon: require('./assets/icone_giochi/yugioh.png'),
    imageScale: 1.25,
  },
  {
    key: 'pokemon',
    name: 'Pokémon',
    image: require('./assets/copertine_giochi/pokemon.png'),
    cardIcon: require('./assets/icone_giochi/pokemon.png'),
    imageScale: 1.35,
  },
  {
    key: 'onepiece',
    name: 'One Piece',
    image: require('./assets/copertine_giochi/onepiece.png'),
    cardIcon: require('./assets/icone_giochi/onepiece.png'),
    imageScale: 1.75,
  },
  {
    key: 'beyblade',
    name: 'Beyblade',
    image: require('./assets/copertine_giochi/beyblade.png'),
    cardIcon: require('./assets/icone_giochi/beyblade.png'),
    imageScale: 1,
  },
  {
    key: 'yugioh_edison',
    name: 'Yu-Gi-Oh! Edison',
    image: require('./assets/copertine_giochi/yugioh_edison.png'),
    cardIcon: require('./assets/icone_giochi/yugioh_edison.png'),
    imageScale: 1,
  },
  {
    key: 'pokemon_champions',
    name: 'Pokémon Champions',
    image: require('./assets/copertine_giochi/pokemon_champions.png'),
    cardIcon: require('./assets/icone_giochi/pokemonchampions.png'),
    imageScale: 1.1,
  },
  {
    key: 'magic',
    name: 'Magic: The Gathering',
    image: require('./assets/copertine_giochi/magic.png'),
    cardIcon: require('./assets/icone_giochi/magic.png'),
    imageScale: 1.05,
  },
  {
    key: 'naruto',
    name: 'Naruto',
    image: require('./assets/copertine_giochi/naruto.png'),
    cardIcon: require('./assets/icone_giochi/naruto.png'),
    imageScale: 1.75,
  },
  {
    key: 'dnd',
    name: 'Dungeons & Dragons',
    image: require('./assets/copertine_giochi/dnd.png'),
    cardIcon: require('./assets/icone_giochi/dnd.png'),
    imageScale: 2,
  },
  {
    key: 'lorcana',
    name: 'Disney Lorcana',
    image: require('./assets/copertine_giochi/lorcana.png'),
    cardIcon: require('./assets/icone_giochi/lorcana.png'),
    imageScale: 1.25,
  },
  {
    key: 'riftbound',
    name: 'Riftbound',
    image: require('./assets/copertine_giochi/riftbound.png'),
    cardIcon: require('./assets/icone_giochi/riftbound.png'),
    imageScale: 1.5,
  },
];

const MONTHS = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
];

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const ENGLISH_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LONG_WEEKDAYS = [
  'Domenica',
  'Lunedì',
  'Martedì',
  'Mercoledì',
  'Giovedì',
  'Venerdì',
  'Sabato',
];
const ENGLISH_LONG_WEEKDAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
const DEFAULT_TIMES = ['15:00', '15:30', '16:00', '16:30', '17:30', '20:00'];
const EVENT_TYPES = ['Ricorrente', 'Occasionale'];
const EXPIRY_OPTIONS = ['3H', '6H', '12H', '24H'];
const DEMO_PARTICIPANTS = [
  { id: 'p1', memberId: '12345678', name: 'Marco Rossi' },
  { id: 'p2', memberId: '27481936', name: 'Giulia Bianchi' },
];

// Esempi di fasce già impegnate: il controllo viene applicato per singola data.
const RESERVED_SLOTS = {
  '2026-08-10': ['17:30'],
  '2026-08-22': ['16:00', '20:00'],
};

function padNumber(value) {
  return String(value).padStart(2, '0');
}

function makeDateKey(year, month, day) {
  return `${year}-${padNumber(month + 1)}-${padNumber(day)}`;
}

function readDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return { day, month: month - 1, year };
}

function getMonthNames(language) {
  return language === 'en' ? ENGLISH_MONTHS : MONTHS;
}

function getWeekdayNames(language) {
  return language === 'en' ? ENGLISH_WEEKDAYS : WEEKDAYS;
}

function formatDate(key, short = false, language = 'it') {
  const { day, month, year } = readDateKey(key);
  const date = new Date(year, month, day);
  const monthNames = getMonthNames(language);
  const longWeekdays = language === 'en' ? ENGLISH_LONG_WEEKDAYS : LONG_WEEKDAYS;

  if (short) {
    return `${padNumber(day)} ${monthNames[month].slice(0, 3)} ${String(year).slice(-2)}`;
  }

  return `${longWeekdays[date.getDay()]} ${day} ${monthNames[month]}`;
}

function buildCalendarCells(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const leadingEmptyCells = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return [
    ...Array.from({ length: leadingEmptyCells }, (_, index) => `empty-${index}`),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}

function toggleArrayValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function collectOccupiedSlots(events) {
  const occupied = Object.fromEntries(
    Object.entries(RESERVED_SLOTS).map(([dateKey, times]) => [dateKey, [...times]]),
  );

  const addTimes = (dateKey, times) => {
    occupied[dateKey] = Array.from(new Set([...(occupied[dateKey] || []), ...times]));
  };

  events.forEach((event) => {
    if (event.type === 'Occasionale') {
      Object.entries(event.schedule.timesByDate).forEach(([dateKey, times]) => {
        addTimes(dateKey, times);
      });
      return;
    }

    const { closedDates, month, times, weekdays, year } = event.schedule;
    const closedDateSet = new Set(closedDates);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const mondayBasedWeekday = (date.getDay() + 6) % 7;
      const dateKey = makeDateKey(year, month, day);

      if (weekdays.includes(mondayBasedWeekday) && !closedDateSet.has(dateKey)) {
        addTimes(dateKey, times);
      }
    }
  });

  return occupied;
}

function buildRecurringDateKeys(year, month, weekdays, closedDates) {
  const closedDateSet = new Set(closedDates);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dateKeys = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const mondayBasedWeekday = (date.getDay() + 6) % 7;
    const dateKey = makeDateKey(year, month, day);

    if (weekdays.includes(mondayBasedWeekday) && !closedDateSet.has(dateKey)) {
      dateKeys.push(dateKey);
    }
  }

  return dateKeys;
}

function makePollOptions(times) {
  const examplePercentages = [15, 50, 35];
  const exampleVotes = [1, 8, 2];

  return times.map((time, index) => ({
    participants: exampleVotes[index] ?? 0,
    percentage: examplePercentages[index] ?? 0,
    time,
  }));
}

function getPollApprovalColor(pollOptions, percentage) {
  const percentages = pollOptions.map((option) => option.percentage);
  const lowest = Math.min(...percentages);
  const highest = Math.max(...percentages);

  if (lowest === highest) {
    return '#E58A2F';
  }
  if (percentage === highest) {
    return '#2DAA6F';
  }
  if (percentage === lowest) {
    return '#CB4E4B';
  }
  return '#E58A2F';
}

function getPollOptionsForDate(event, dateKey) {
  if (event.type !== 'Occasionale') {
    return event.pollOptions;
  }

  const availableTimes = event.schedule.timesByDate[dateKey] ?? [];
  return event.pollOptions.filter((option) => availableTimes.includes(option.time));
}

function getOccasionalPollChoices(event) {
  if (!event || event.type !== 'Occasionale') {
    return [];
  }

  return [...event.dateKeys]
    .sort()
    .flatMap((dateKey) => (event.schedule.timesByDate[dateKey] ?? []).map((time) => {
      const statistics = event.pollOptions.find((option) => option.time === time) ?? {
        participants: 0,
        percentage: 0,
      };

      return {
        ...statistics,
        dateKey,
        key: `${dateKey}|${time}`,
        time,
      };
    }));
}

function formatOccasionalPollChoice(dateKey, time) {
  const { day, month } = readDateKey(dateKey);
  return `${padNumber(day)}/${padNumber(month + 1)}, ${time}`;
}

function getUserVoteKey(event, dateKey) {
  return event.type === 'Occasionale' ? event.id : `${event.id}-${dateKey}`;
}

function removeEventOccurrence(events, eventId, dateKey) {
  return events.flatMap((event) => {
    if (event.id !== eventId || !event.dateKeys.includes(dateKey)) {
      return [event];
    }

    const remainingDateKeys = event.dateKeys.filter((key) => key !== dateKey);
    if (remainingDateKeys.length === 0) {
      return [];
    }

    const confirmedTimesByDate = Object.fromEntries(
      Object.entries(event.confirmedTimesByDate ?? {}).filter(([key]) => key !== dateKey),
    );

    if (event.type === 'Ricorrente') {
      return [{
        ...event,
        confirmedTimesByDate,
        dateKeys: remainingDateKeys,
        schedule: {
          ...event.schedule,
          closedDates: Array.from(
            new Set([...(event.schedule.closedDates ?? []), dateKey]),
          ).sort(),
        },
      }];
    }

    const timesByDate = { ...event.schedule.timesByDate };
    delete timesByDate[dateKey];

    return [{
      ...event,
      confirmedTimesByDate,
      dateKeys: remainingDateKeys,
      detail: remainingDateKeys
        .map((key) => `${formatDate(key, true)} · ${(timesByDate[key] ?? []).join(', ')}`)
        .join(' | '),
      schedule: {
        ...event.schedule,
        timesByDate,
      },
    }];
  });
}

function getExpiryHours(expiry, customExpiry) {
  if (!expiry) {
    return null;
  }
  if (expiry === 'Personalizzata') {
    const hours = Number(customExpiry);
    return Number.isFinite(hours) && hours > 0 ? hours : null;
  }
  return Number.parseInt(expiry, 10);
}

function getRemainingParts(deadline, now) {
  if (!deadline) {
    return null;
  }

  const remainingSeconds = Math.max(0, Math.floor((deadline - now) / 1000));
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return { days, hours, minutes, seconds };
}

function getPollDeadline(dateKey, time, expiryHours) {
  if (!dateKey || !time || !expiryHours) {
    return null;
  }

  const { day, month, year } = readDateKey(dateKey);
  const [hours, minutes] = time.split(':').map(Number);
  const eventStartsAt = new Date(year, month, day, hours, minutes).getTime();
  return eventStartsAt - expiryHours * 60 * 60 * 1000;
}

function formatCompactCountdown(deadline, now) {
  if (!deadline) {
    return '--:--:--';
  }

  const remainingSeconds = Math.max(0, Math.floor((deadline - now) / 1000));
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return [hours, minutes, seconds].map(padNumber).join(':');
}

function CountdownDisplay({ deadline, now }) {
  const { t } = useAppTheme();
  const remaining = getRemainingParts(deadline, now);

  if (!remaining) {
    return <Text style={styles.eventNoDeadline}>{t('noDeadline')}</Text>;
  }

  const units = [
    ...(remaining.days > 0
      ? [{ label: t('days'), value: remaining.days }]
      : []),
    { label: t('hours'), value: remaining.hours },
    { label: t('minutes'), value: remaining.minutes },
    { label: t('seconds'), value: remaining.seconds },
  ];

  return (
    <View style={styles.countdownDisplay}>
      {units.map((unit, index) => (
        <View key={unit.label} style={styles.countdownChunk}>
          <View style={styles.countdownUnit}>
            <Text style={styles.countdownNumber}>{padNumber(unit.value)}</Text>
            <Text style={styles.countdownLabel}>{unit.label}</Text>
          </View>
          {index < units.length - 1 && <Text style={styles.countdownColon}>:</Text>}
        </View>
      ))}
    </View>
  );
}

function createDemoEvent() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const year = now.getFullYear();
  const month = now.getMonth();
  const weekday = (tomorrow.getDay() + 6) % 7;
  const times = ['15:00', '16:00', '15:30'];
  const closedDates = [];

  return {
    dateKeys: buildRecurringDateKeys(year, month, [weekday], closedDates),
    detail: `${MONTHS[month]} · ${WEEKDAYS[weekday]} · ${times.join(', ')}`,
    expiry: '3H',
    expiryHours: 3,
    game: EVENT_GAMES[0],
    id: 'demo-yugioh-event',
    participants: DEMO_PARTICIPANTS,
    pollOptions: makePollOptions(times),
    schedule: {
      closedDates,
      month,
      times,
      weekdays: [weekday],
      year,
    },
    type: 'Ricorrente',
  };
}

function PrimaryButton({ disabled, label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function StepIndicator({ currentStep }) {
  const { colors, isDark } = useAppTheme();
  const linePulse = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (currentStep === 1) {
      return undefined;
    }

    linePulse.setValue(0);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(linePulse, {
          duration: 420,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(linePulse, {
          duration: 420,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 2 },
    );
    animation.start();

    return () => animation.stop();
  }, [currentStep, linePulse]);

  return (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step, index) => (
        <View key={step} style={styles.stepItem}>
          {index > 0 && (
            <Animated.View
              style={[
                styles.stepLine,
                currentStep >= step && styles.stepLineActive,
                currentStep === step && {
                  opacity: linePulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                  transform: [
                    {
                      scaleX: linePulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1.12],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
          <View
            style={[
              styles.stepCircle,
              isDark && { backgroundColor: colors.background },
              currentStep === step && styles.stepCircleCurrent,
              currentStep > step && styles.stepCircleComplete,
              isDark && currentStep > step && { backgroundColor: colors.cardAlt },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                currentStep === step && styles.stepNumberCurrent,
                currentStep > step && styles.stepNumberComplete,
              ]}
            >
              {step}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function Dropdown({ label, onSelect, open, options, selected, setOpen }) {
  const { colors, isDark, t } = useAppTheme();
  const optionLabel = (option) => option === 'Ricorrente' ? t('recurring') : t('occasional');
  return (
    <View style={styles.dropdownWrap}>
      {label ? <Text style={styles.sectionTitle}>{label}</Text> : null}
      <Pressable
        accessibilityLabel={`${t('eventType')}: ${optionLabel(selected)}`}
        accessibilityRole="button"
        onPress={() => setOpen(!open)}
        style={({ pressed }) => [
          styles.dropdownButton,
          isDark && { backgroundColor: colors.card, borderColor: colors.border },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.dropdownText, isDark && { color: colors.text }]}>{optionLabel(selected).toUpperCase()}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </Pressable>

      {open && (
        <View style={[styles.dropdownMenu, isDark && { backgroundColor: colors.card }] }>
          {options.map((option) => (
            <Pressable
              accessibilityRole="button"
              key={option}
              onPress={() => {
                onSelect(option);
                setOpen(false);
              }}
              style={({ pressed }) => [
                styles.dropdownOption,
                option === selected && styles.dropdownOptionSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  isDark && { color: colors.text },
                  option === selected && styles.dropdownOptionTextSelected,
                ]}
              >
                {optionLabel(option)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function MiniCalendar({
  month,
  onMonthChange,
  onToggle,
  selectedKeys,
  selectionKind = 'date',
  year,
}) {
  const { colors, isDark, language, t } = useAppTheme();
  const monthNames = getMonthNames(language);
  const weekdayNames = getWeekdayNames(language);
  const cells = useMemo(() => buildCalendarCells(year, month), [month, year]);

  const moveMonth = (direction) => {
    if (!onMonthChange) {
      return;
    }

    const nextDate = new Date(year, month + direction, 1);
    onMonthChange(nextDate.getFullYear(), nextDate.getMonth());
  };

  return (
    <View style={[styles.calendar, isDark && { backgroundColor: colors.cardAlt }] }>
      <View style={styles.calendarHeader}>
        {onMonthChange ? (
          <Pressable
            accessibilityLabel={t('previousMonth')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => moveMonth(-1)}
            style={styles.calendarArrowButton}
          >
            <Text style={styles.calendarArrow}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.calendarArrowButton} />
        )}
        <Text style={[styles.calendarMonth, isDark && { color: colors.text }]}>{monthNames[month]} {year}</Text>
        {onMonthChange ? (
          <Pressable
            accessibilityLabel={t('nextMonth')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => moveMonth(1)}
            style={styles.calendarArrowButton}
          >
            <Text style={styles.calendarArrow}>›</Text>
          </Pressable>
        ) : (
          <View style={styles.calendarArrowButton} />
        )}
      </View>

      <View style={styles.calendarWeekRow}>
        {weekdayNames.map((day) => (
          <Text key={day} style={[styles.calendarWeekday, isDark && { color: colors.muted }]}>{day.slice(0, 1)}</Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {cells.map((cell) => {
          if (typeof cell !== 'number') {
            return <View key={cell} style={styles.calendarCell} />;
          }

          const key = makeDateKey(year, month, cell);
          const selected = selectedKeys.includes(key);

          return (
            <View key={key} style={styles.calendarCell}>
              <Pressable
                accessibilityLabel={`${selected ? t('deselect') : t('select')} ${formatDate(key, false, language)}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onToggle(key)}
                style={({ pressed }) => [
                  styles.calendarDay,
                  selected &&
                    (selectionKind === 'closed'
                      ? styles.calendarDayClosed
                      : styles.calendarDaySelected),
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    isDark && { color: colors.text },
                    selected && styles.calendarDayTextSelected,
                  ]}
                >
                  {cell}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function PanelHeading({ subtitle, title }) {
  const { colors, isDark } = useAppTheme();
  return (
    <View style={styles.panelHeading}>
      <View style={styles.panelHeadingCopy}>
        <Text style={[styles.panelHeadingTitle, isDark && { color: colors.text }]}>{title}</Text>
        <Text style={[styles.panelHeadingSubtitle, isDark && { color: colors.muted }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

function RadioChip({ compact, disabled, label, large, onPress, selected, unavailable }) {
  const { colors, isDark, t } = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={`${label}${unavailable ? `, ${t('unavailable')}` : ''}`}
      accessibilityRole="button"
      accessibilityState={{ checked: selected, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.radioChip,
        isDark && { backgroundColor: colors.cardAlt },
        compact && styles.radioChipCompact,
        large && styles.radioChipLarge,
        unavailable && styles.radioChipUnavailable,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.radioCircle,
          large && styles.radioCircleLarge,
          selected && styles.radioCircleSelected,
          unavailable && styles.radioCircleUnavailable,
        ]}
      />
      <Text
        style={[
          styles.radioLabel,
          isDark && { color: colors.text },
          large && styles.radioLabelLarge,
          unavailable && styles.radioLabelUnavailable,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function NewTimeInput({ onAdd }) {
  const { colors, isDark, t } = useAppTheme();
  const [value, setValue] = useState('');
  const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

  return (
    <View style={styles.newTimeRow}>
      <TextInput
        accessibilityLabel={t('newTime')}
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        onChangeText={setValue}
        placeholder="HH:MM"
        placeholderTextColor="#A9AFB9"
        style={[styles.newTimeInput, isDark && { backgroundColor: colors.cardAlt, color: colors.text }]}
        value={value}
      />
      <Pressable
        accessibilityLabel={t('addTime')}
        accessibilityRole="button"
        accessibilityState={{ disabled: !valid }}
        disabled={!valid}
        onPress={() => {
          onAdd(value);
          setValue('');
        }}
        style={({ pressed }) => [
          styles.newTimeAdd,
          !valid && styles.newTimeAddDisabled,
          pressed && valid && styles.pressed,
        ]}
      >
        <Text style={styles.newTimeAddText}>+</Text>
      </Pressable>
    </View>
  );
}

function getWeekData(selectedDateKey) {
  const { day, month, year } = readDateKey(selectedDateKey);
  const selectedDate = new Date(year, month, day);
  const mondayOffset = (selectedDate.getDay() + 6) % 7;
  const monday = new Date(year, month, day - mondayOffset);
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      date,
      key: makeDateKey(date.getFullYear(), date.getMonth(), date.getDate()),
    };
  });
  const firstMonthDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const weekNumber = Math.ceil((day + firstMonthDayOffset) / 7);

  return { dates, month, weekNumber, year };
}

function WeekCalendar({ eventDateKeys, onSelectDate, selectedDateKey }) {
  const { colors, isDark, language, t } = useAppTheme();
  const monthNames = getMonthNames(language);
  const weekdayNames = getWeekdayNames(language);
  const week = getWeekData(selectedDateKey);

  const moveWeek = (direction) => {
    const { day, month, year } = readDateKey(selectedDateKey);
    const nextDate = new Date(year, month, day + direction * 7);
    onSelectDate(makeDateKey(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate()));
  };

  return (
    <View style={[styles.weekCalendarCard, isDark && { backgroundColor: colors.card }] }>
      <View style={styles.weekCalendarHeader}>
        <Pressable
          accessibilityLabel={t('previousWeek')}
          accessibilityRole="button"
          onPress={() => moveWeek(-1)}
          style={({ pressed }) => [styles.weekNavButton, pressed && styles.pressed]}
        >
          <Text style={styles.weekNavText}>‹</Text>
        </Pressable>

        <View style={styles.weekCalendarHeading}>
          <Text style={[styles.weekCalendarMonth, isDark && { color: colors.text }]}>{monthNames[week.month]} {week.year}</Text>
          <Text style={styles.weekCalendarNumber}>{t('week')} {week.weekNumber}</Text>
        </View>

        <Pressable
          accessibilityLabel={t('nextWeek')}
          accessibilityRole="button"
          onPress={() => moveWeek(1)}
          style={({ pressed }) => [styles.weekNavButton, pressed && styles.pressed]}
        >
          <Text style={styles.weekNavText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekDaysRow}>
        {week.dates.map(({ date, key }, index) => {
          const selected = key === selectedDateKey;
          const hasEvents = eventDateKeys.has(key);

          return (
            <Pressable
              accessibilityLabel={`${selected ? t('selectedDate') : t('select')} ${formatDate(key, false, language)}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={key}
              onPress={() => onSelectDate(key)}
              style={({ pressed }) => [
                styles.weekDay,
                isDark && { backgroundColor: colors.cardAlt },
                selected && styles.weekDaySelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.weekDayLabel, isDark && { color: colors.muted }, selected && styles.weekDayLabelSelected]}>
                {weekdayNames[index]}
              </Text>
              <Text style={[styles.weekDayNumber, isDark && { color: colors.text }, selected && styles.weekDayNumberSelected]}>
                {date.getDate()}
              </Text>
              <View style={[styles.weekEventDot, hasEvents && styles.weekEventDotVisible]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function EventCard({ event, now, onMenu, onParticipants, selectedDateKey }) {
  const { colors, isDark, t } = useAppTheme();
  const eventTypeLabel = event.type === 'Ricorrente' ? t('recurring') : t('occasional');
  const pollOptionsForDate = getPollOptionsForDate(event, selectedDateKey);
  const leadingOption = pollOptionsForDate.reduce(
    (highest, option) =>
      !highest || option.percentage > highest.percentage ? option : highest,
    null,
  );
  const confirmedTime = event.confirmedTimesByDate?.[selectedDateKey];
  const confirmedOption = confirmedTime
    ? pollOptionsForDate.find((option) => option.time === confirmedTime)
    : null;
  const displayedOption = confirmedOption ?? leadingOption;
  const pollDeadline = getPollDeadline(
    selectedDateKey,
    displayedOption?.time,
    event.expiryHours,
  );

  return (
    <View style={styles.eventSummaryCard}>
      <View style={[styles.eventSummaryBackground, isDark && { backgroundColor: colors.card }]} />
      <View style={styles.eventSummaryMain}>
        <Image
          resizeMode="contain"
          source={event.game.cardIcon}
          style={styles.eventSummaryLogo}
        />
        <View style={styles.eventSummaryTopRow}>
          <View style={styles.eventSummaryCopy}>
            <View style={styles.eventSummaryHeadingRow}>
              <View style={styles.eventSummaryHeadingCopy}>
                <Text style={[styles.eventSummaryType, isDark && { color: colors.accent }]}>{eventTypeLabel.toUpperCase()}</Text>
                <Text numberOfLines={1} style={[styles.eventSummaryTitle, isDark && { color: colors.text }]}>{event.game.name}</Text>
              </View>
              <Pressable
                accessibilityLabel={`${t('openMenu')} ${event.game.name}`}
                accessibilityRole="button"
                onPress={onMenu}
                style={({ pressed }) => [
                  styles.eventMenuButton,
                  isDark && { backgroundColor: colors.cardAlt },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.eventMenuIcon}>☰</Text>
              </Pressable>
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.eventSummaryDetail,
                isDark && { color: colors.muted },
                confirmedOption && styles.eventSummaryDetailConfirmed,
              ]}
            >
              {confirmedOption
                ? `${t('startAt')} ${confirmedOption.time}`
                : leadingOption
                  ? `${t('scheduleTime')}: ${leadingOption.time} · ${leadingOption.percentage}%`
                  : t('timeUndefined')}
            </Text>
          </View>
        </View>
        <View style={styles.eventTimeoutRow}>
          <CountdownDisplay deadline={pollDeadline} now={now} />
        </View>
      </View>

      <View style={styles.eventParticipantsArea}>
        <EventsCurve
          color="#294E9F"
          height={140}
          pointerEvents="none"
          style={styles.eventParticipantsCurve}
          width={137}
        />
        <View style={styles.eventParticipantsContent}>
          <Pressable
            accessibilityLabel={`${event.participants.length} ${t('participants')}`}
            accessibilityRole="button"
            hitSlop={6}
            onPress={onParticipants}
            style={({ pressed }) => [
              styles.eventParticipantsNumberButton,
              pressed && styles.participantsNumberPressed,
            ]}
          >
            <Text style={styles.eventParticipantsValue}>{event.participants.length}</Text>
          </Pressable>
          <UsersIcon width={29} height={29} />
        </View>
      </View>
    </View>
  );
}

function UserEventCard({ event, now, onParticipants, onVote, selectedDateKey, votedTime }) {
  const { colors, isDark, language, t } = useAppTheme();
  const pollOptionsForDate = getPollOptionsForDate(event, selectedDateKey);
  const leadingOption = pollOptionsForDate.reduce(
    (highest, option) =>
      !highest || option.percentage > highest.percentage ? option : highest,
    null,
  );
  const confirmedTime = event.confirmedTimesByDate?.[selectedDateKey] ?? null;
  const pollDeadline = getPollDeadline(
    selectedDateKey,
    confirmedTime ?? leadingOption?.time,
    event.expiryHours,
  );
  const hasVoted = Array.isArray(votedTime) ? votedTime.length > 0 : Boolean(votedTime);
  const voteResultLabel = Array.isArray(votedTime)
    ? votedTime.includes(ABSENT_VOTE)
      ? t('absent')
      : `${votedTime.length} ${t(votedTime.length === 1 ? 'choice' : 'choices')}`
    : votedTime === ABSENT_VOTE
      ? t('absent')
      : `${t('hoursShort')} ${votedTime}`;

  return (
    <View style={[styles.userEventSummaryCard, isDark && { backgroundColor: colors.card }] }>
      <View style={styles.userEventSummaryMain}>
        <Image
          accessibilityLabel={event.game.name}
          resizeMode="contain"
          source={event.game.cardIcon}
          style={styles.userEventSummaryLogo}
        />

          <View style={styles.userEventSummaryCopy}>
            <View style={styles.userEventSummaryTopRow}>
              <View style={styles.userEventDateGroup}>
                <Text style={[styles.userEventSummaryDate, isDark && { color: colors.text }]}>
                  {formatDate(selectedDateKey, true, language)}
                </Text>
                <Text
                  style={[
                    styles.userEventType,
                    event.type === 'Occasionale' && styles.userEventTypeOccasional,
                  ]}
                >
                  {t(event.type === 'Occasionale' ? 'occasional' : 'recurring').toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userEventSummaryCountdown}>
                {formatCompactCountdown(pollDeadline, now)}
              </Text>
          </View>

          <View style={styles.userEventSummaryBottomRow}>
            <View style={styles.userEventStartBlock}>
              <Text style={styles.userEventStartLabel}>{t('start')}</Text>
              <Text style={styles.userEventStartTime}>
                {t('hoursShort')} {confirmedTime ?? '--:--'}
              </Text>
            </View>

            {hasVoted ? (
              <Pressable
                accessibilityLabel={t('modifyVote')}
                accessibilityRole="button"
                onPress={onVote}
                style={({ pressed }) => [styles.userVoteResult, pressed && styles.pressed]}
              >
                <View style={styles.userVoteResultLine}>
                  <Text style={styles.userVotedLabel}>{t('youVoted')}</Text>
                  <Text style={styles.userVotedTime}>{voteResultLabel}</Text>
                </View>
                <Text style={styles.userModifyVote}>{t('modifyVote')} ⚙</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityLabel={t('votePoll')}
                accessibilityRole="button"
                onPress={onVote}
                style={({ pressed }) => [styles.userVoteButton, pressed && styles.pressed]}
              >
                <Text style={styles.userVoteButtonText}>{t('votePoll')}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <View style={styles.userPlayersPanel}>
        <UserEventCurve
          height={82}
          pointerEvents="none"
          style={styles.userPlayersCurve}
          width={100}
        />
        <Pressable
          accessibilityLabel={`${event.participants.length} ${t('players')}`}
          accessibilityRole="button"
          onPress={onParticipants}
          style={({ pressed }) => [
            styles.userPlayersPressable,
            pressed && styles.userPlayersPressed,
          ]}
        >
          <Text style={styles.userPlayersValue}>{event.participants.length}</Text>
          <Text style={styles.userPlayersLabel}>{t('players')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PopupBackdrop({ children, onClose }) {
  const { isDark, t } = useAppTheme();
  return (
    <View style={styles.modalRoot}>
      <BlurView
        blurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        intensity={35}
        style={StyleSheet.absoluteFillObject}
        tint={isDark ? 'dark' : 'light'}
      />
      <Pressable
        accessibilityLabel={t('close')}
        onPress={onClose}
        style={styles.modalDismissArea}
      />
      {children}
    </View>
  );
}

function PopupCloseButton({ onPress }) {
  const { t } = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={t('close')}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.eventPopupClose, pressed && styles.pressed]}
    >
      <Text style={styles.eventPopupCloseText}>×</Text>
    </Pressable>
  );
}

function EventManagementPopup({ event, onClose, onConfirmTime, onDelete, onModify, selectedDateKey }) {
  const { colors, isDark, language, t } = useAppTheme();
  const isOccasional = event?.type === 'Occasionale';
  const pollChoices = event
    ? isOccasional
      ? getOccasionalPollChoices(event)
      : getPollOptionsForDate(event, selectedDateKey).map((option) => ({
          ...option,
          dateKey: selectedDateKey,
          key: option.time,
        }))
    : [];
  const confirmedTimeForDate = event?.confirmedTimesByDate?.[selectedDateKey] ?? null;
  const [selectedChoiceKey, setSelectedChoiceKey] = useState(
    confirmedTimeForDate
      ? isOccasional
        ? `${selectedDateKey}|${confirmedTimeForDate}`
        : confirmedTimeForDate
      : null,
  );
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const confirmedTime = event?.confirmedTimesByDate?.[selectedDateKey] ?? null;
    setSelectedChoiceKey(
      confirmedTime
        ? event?.type === 'Occasionale'
          ? `${selectedDateKey}|${confirmedTime}`
          : confirmedTime
        : null,
    );
    setConfirmation(null);
  }, [event, selectedDateKey]);

  if (!event) {
    return null;
  }

  const confirmSelectedTime = () => {
    const selectedChoice = pollChoices.find((option) => option.key === selectedChoiceKey);
    if (!selectedChoice) {
      return;
    }
    onConfirmTime(event.id, selectedChoice.dateKey, selectedChoice.time);
    setConfirmation(selectedChoice);
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <PopupBackdrop onClose={onClose}>
        <View style={[styles.eventManagementPopup, isDark && { backgroundColor: colors.card }] }>
          <PopupCloseButton onPress={onClose} />
          <View style={styles.eventPopupLogoFrame}>
            <Image
              resizeMode="contain"
              source={event.game.image}
              style={[
                styles.eventPopupLogo,
                { transform: [{ scale: event.game.imageScale }] },
              ]}
            />
          </View>
          <Text style={styles.eventPopupFormat}>{(event.type === 'Ricorrente' ? t('recurring') : t('occasional')).toUpperCase()}</Text>

          {confirmation ? (
            <View style={styles.timeConfirmationPanel}>
              <View style={styles.timeConfirmationCheck}>
                <Text style={styles.timeConfirmationCheckText}>✓</Text>
              </View>
              <Text style={styles.timeConfirmationTitle}>{t('eventConfirmed')}</Text>
              <Text style={styles.timeConfirmationDate}>
                {formatDate(confirmation.dateKey, false, language)}
              </Text>
              <Text style={[styles.timeConfirmationMessage, isDark && { color: colors.text }]}>
                {t('eventWillTakePlaceAt')} {confirmation.time}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [
                  styles.popupActionButton,
                  styles.popupConfirmButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.popupActionText}>{t('close').toUpperCase()}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <ScrollView
                contentContainerStyle={styles.pollOptionsList}
                showsVerticalScrollIndicator={false}
                style={styles.pollOptionsScroll}
              >
                {pollChoices.map((option) => {
                  const selected = selectedChoiceKey === option.key;
                  const color = getPollApprovalColor(pollChoices, option.percentage);
                  const optionLabel = isOccasional
                    ? formatOccasionalPollChoice(option.dateKey, option.time)
                    : option.time;

                  return (
                    <Pressable
                      accessibilityLabel={`${t('select')} ${optionLabel}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={`${event.id}-${option.key}`}
                      onPress={() => setSelectedChoiceKey(option.key)}
                      style={({ pressed }) => [
                        styles.pollOptionRow,
                        isDark && { backgroundColor: colors.cardAlt },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.pollRadio,
                          { borderColor: color },
                          selected && { backgroundColor: color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.pollTime,
                          isOccasional && styles.adminOccasionalPollLabel,
                          isDark && { color: colors.text },
                        ]}
                      >
                        {optionLabel}
                      </Text>
                      <Text style={[styles.pollPercentage, { color }]}>{option.percentage}%</Text>
                      <Text style={[styles.pollParticipantsCount, isDark && { color: colors.text }]}>{option.participants}</Text>
                      <View style={styles.pollUsersIconBadge}>
                        <UsersIcon width={14} height={14} />
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.eventPopupActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !selectedChoiceKey }}
                  disabled={!selectedChoiceKey}
                  onPress={confirmSelectedTime}
                  style={({ pressed }) => [
                    styles.popupActionButton,
                    styles.popupConfirmButton,
                    !selectedChoiceKey && styles.popupConfirmButtonDisabled,
                    pressed && selectedChoiceKey && styles.pressed,
                  ]}
                >
                  <Text style={styles.popupActionText}>{t('confirm').toUpperCase()}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={onModify}
                  style={({ pressed }) => [styles.popupActionButton, styles.popupModifyButton, pressed && styles.pressed]}
                >
                  <Text style={styles.popupActionText}>{t('modify')}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={onDelete}
                  style={({ pressed }) => [styles.popupActionButton, styles.popupDeleteButton, pressed && styles.pressed]}
                >
                  <Text style={styles.popupActionText}>{t('delete')}</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </PopupBackdrop>
    </Modal>
  );
}

function UserVotePopup({ event, onClose, onVote, selectedDateKey, votedTime }) {
  const { colors, isDark, t } = useAppTheme();
  const isOccasional = event?.type === 'Occasionale';
  const [selectedTime, setSelectedTime] = useState(
    typeof votedTime === 'string' ? votedTime : null,
  );
  const [selectedChoices, setSelectedChoices] = useState(
    Array.isArray(votedTime) ? votedTime : [],
  );
  const pollOptions = event ? getPollOptionsForDate(event, selectedDateKey) : [];
  const occasionalChoices = event ? getOccasionalPollChoices(event) : [];
  const absentSelected = isOccasional
    ? selectedChoices.includes(ABSENT_VOTE)
    : selectedTime === ABSENT_VOTE;
  const canConfirmVote = isOccasional ? selectedChoices.length > 0 : Boolean(selectedTime);

  useEffect(() => {
    if (event?.type === 'Occasionale') {
      setSelectedChoices(
        Array.isArray(votedTime)
          ? votedTime
          : votedTime
            ? [votedTime]
            : [],
      );
      setSelectedTime(null);
      return;
    }

    setSelectedTime(typeof votedTime === 'string' ? votedTime : null);
    setSelectedChoices([]);
  }, [event, selectedDateKey, votedTime]);

  if (!event) {
    return null;
  }

  const toggleOccasionalChoice = (choiceKey) => {
    setSelectedChoices((currentChoices) => {
      const choicesWithoutAbsence = currentChoices.filter((choice) => choice !== ABSENT_VOTE);
      return choicesWithoutAbsence.includes(choiceKey)
        ? choicesWithoutAbsence.filter((choice) => choice !== choiceKey)
        : [...choicesWithoutAbsence, choiceKey];
    });
  };

  const selectAbsence = () => {
    if (isOccasional) {
      setSelectedChoices((currentChoices) =>
        currentChoices.includes(ABSENT_VOTE) ? [] : [ABSENT_VOTE]);
      return;
    }
    setSelectedTime(ABSENT_VOTE);
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <PopupBackdrop onClose={onClose}>
        <View
          style={[
            styles.userVotePopup,
            isOccasional && styles.userOccasionalVotePopup,
            isDark && { backgroundColor: colors.card },
          ]}
        >
          <PopupCloseButton onPress={onClose} />
          {isOccasional ? (
            <Text style={styles.userOccasionalVoteTitle}>{t('multipleChoice')}</Text>
          ) : (
            <>
              <Image
                accessibilityLabel={event.game.name}
                resizeMode="contain"
                source={event.game.image}
                style={styles.userVotePopupLogo}
              />
              <Text style={[styles.userVotePopupTitle, isDark && { color: colors.text }]}>
                {t('votePoll').toUpperCase()}
              </Text>
            </>
          )}

          <ScrollView
            contentContainerStyle={styles.pollOptionsList}
            showsVerticalScrollIndicator={false}
            style={[
              styles.userVoteOptionsScroll,
              isOccasional && styles.userOccasionalVoteOptionsScroll,
            ]}
          >
            {isOccasional
              ? occasionalChoices.map((choice) => {
                  const selected = selectedChoices.includes(choice.key);
                  const choiceLabel = formatOccasionalPollChoice(choice.dateKey, choice.time);

                  return (
                    <Pressable
                      accessibilityLabel={`${selected ? t('deselect') : t('select')} ${choiceLabel}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={`${event.id}-${choice.key}`}
                      onPress={() => toggleOccasionalChoice(choice.key)}
                      style={({ pressed }) => [
                        styles.userOccasionalChoiceRow,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.userOccasionalChoiceRadio,
                          selected && styles.userOccasionalChoiceRadioSelected,
                        ]}
                      />
                      <Text
                        style={[
                          styles.userOccasionalChoiceText,
                          isDark && { color: colors.text },
                        ]}
                      >
                        {choiceLabel}
                      </Text>
                    </Pressable>
                  );
                })
              : pollOptions.map((option) => {
                  const selected = selectedTime === option.time;
                  const color = getPollApprovalColor(pollOptions, option.percentage);

                  return (
                    <Pressable
                      accessibilityLabel={`${t('select')} ${option.time}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={`${event.id}-${selectedDateKey}-${option.time}`}
                      onPress={() => setSelectedTime(option.time)}
                      style={({ pressed }) => [
                        styles.pollOptionRow,
                        isDark && { backgroundColor: colors.cardAlt },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.pollRadio,
                          { borderColor: color },
                          selected && { backgroundColor: color },
                        ]}
                      />
                      <Text style={[styles.pollTime, isDark && { color: colors.text }]}>{option.time}</Text>
                      <Text style={[styles.pollPercentage, { color }]}>{option.percentage}%</Text>
                      <Text style={[styles.pollParticipantsCount, isDark && { color: colors.text }]}>{option.participants}</Text>
                      <View style={styles.pollUsersIconBadge}>
                        <UsersIcon width={14} height={14} />
                      </View>
                    </Pressable>
                  );
                })}

            <Pressable
              accessibilityLabel={t('absent')}
              accessibilityRole="button"
              accessibilityState={{ selected: absentSelected }}
              onPress={selectAbsence}
              style={({ pressed }) => [
                isOccasional ? styles.userOccasionalChoiceRow : styles.pollOptionRow,
                styles.userAbsentVoteRow,
                isDark && { borderTopColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  isOccasional ? styles.userOccasionalChoiceRadio : styles.pollRadio,
                  styles.userAbsentVoteRadio,
                  absentSelected && styles.userAbsentVoteRadioSelected,
                ]}
              />
              <Text
                style={[
                  styles.userAbsentVoteText,
                  isOccasional && styles.userOccasionalAbsentText,
                  isDark && { color: colors.text },
                ]}
              >
                {t('absent')}
              </Text>
            </Pressable>
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canConfirmVote }}
            disabled={!canConfirmVote}
            onPress={() => {
              onVote(isOccasional ? selectedChoices : selectedTime);
              onClose();
            }}
            style={({ pressed }) => [
              styles.popupActionButton,
              styles.popupConfirmButton,
              !canConfirmVote && styles.popupConfirmButtonDisabled,
              pressed && canConfirmVote && styles.pressed,
            ]}
          >
            <Text style={[styles.popupActionText, styles.userVoteConfirmText]}>
              {t('confirmVote').toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </PopupBackdrop>
    </Modal>
  );
}

function ParticipantAvatar() {
  return (
    <View style={styles.participantAvatar}>
      <View style={styles.participantAvatarHead} />
      <View style={styles.participantAvatarBody} />
    </View>
  );
}

function ParticipantsPopup({ event, onClose }) {
  const { colors, isDark, t } = useAppTheme();
  if (!event) {
    return null;
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <PopupBackdrop onClose={onClose}>
        <View style={[styles.participantsPopup, isDark && { backgroundColor: colors.card }] }>
          <PopupCloseButton onPress={onClose} />
          <Image
            resizeMode="contain"
            source={event.game.image}
            style={[
              styles.participantsPopupLogo,
              { transform: [{ scale: Math.min(event.game.imageScale, 1.55) }] },
            ]}
          />
          <Text style={[styles.participantsPopupTitle, isDark && { color: colors.text }]}>{t('listParticipants')}</Text>

          <ScrollView
            contentContainerStyle={styles.participantsList}
            showsVerticalScrollIndicator={false}
            style={styles.participantsScroll}
          >
            {event.participants.length === 0 ? (
              <Text style={[styles.noParticipantsText, isDark && { color: colors.muted }]}>{t('noRegisteredParticipants')}</Text>
            ) : (
              event.participants.map((participant) => (
                <View key={participant.id} style={[styles.participantCard, isDark && { backgroundColor: colors.cardAlt }] }>
                  <ParticipantAvatar />
                  <View style={styles.participantCopy}>
                    <Text style={[styles.participantName, isDark && { color: colors.text }]}>{participant.name}</Text>
                    <Text style={[styles.participantId, isDark && { color: colors.muted }]}>{t('codeId')}: {participant.memberId}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </PopupBackdrop>
    </Modal>
  );
}

function EventsList({ events, now, onConfirmTime, onCreate, onDelete, onModify, readOnly }) {
  const { colors, isDark, t } = useAppTheme();
  const today = new Date();
  const todayKey = makeDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    if (events.some((event) => event.dateKeys.includes(todayKey))) {
      return todayKey;
    }

    return events
      .flatMap((event) => event.dateKeys)
      .filter((dateKey) => dateKey >= todayKey)
      .sort()[0] ?? todayKey;
  });
  const [menuEvent, setMenuEvent] = useState(null);
  const [participantsEvent, setParticipantsEvent] = useState(null);
  const [voteEvent, setVoteEvent] = useState(null);
  const [userVotes, setUserVotes] = useState({});
  const eventDateKeys = useMemo(
    () => new Set(events.flatMap((event) => event.dateKeys)),
    [events],
  );
  const visibleEvents = events.filter((event) => event.dateKeys.includes(selectedDateKey));

  return (
    <View style={styles.listScreen}>
      <WeekCalendar
        eventDateKeys={eventDateKeys}
        onSelectDate={setSelectedDateKey}
        selectedDateKey={selectedDateKey}
      />

      <ScrollView
        contentContainerStyle={styles.eventsListContent}
        showsVerticalScrollIndicator={false}
        style={styles.eventsList}
      >
        {visibleEvents.length === 0 ? (
          <Text style={[styles.emptyEventsText, isDark && { color: colors.text }]}>{t('emptyDay')}</Text>
        ) : (
          visibleEvents.map((event) => {
            const voteKey = getUserVoteKey(event, selectedDateKey);

            return readOnly ? (
              <UserEventCard
                event={event}
                key={event.id}
                now={now}
                onParticipants={() => setParticipantsEvent(event)}
                onVote={() => setVoteEvent(event)}
                selectedDateKey={selectedDateKey}
                votedTime={userVotes[voteKey]}
              />
            ) : (
              <EventCard
                event={event}
                key={event.id}
                now={now}
                onMenu={() => setMenuEvent(event)}
                onParticipants={() => setParticipantsEvent(event)}
                selectedDateKey={selectedDateKey}
              />
            );
          })
        )}
      </ScrollView>

      {!readOnly && (
        <Pressable
          accessibilityLabel={t('createEvent')}
          accessibilityRole="button"
          onPress={onCreate}
          style={({ pressed }) => [
            styles.createEventButton,
            isDark && { backgroundColor: colors.card, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.createEventPlusCircle}>
            <Text style={styles.createEventPlus}>+</Text>
          </View>
          <Text style={styles.createEventText}>{t('createEvent')}</Text>
        </Pressable>
      )}

      {!readOnly && (
        <EventManagementPopup
          event={menuEvent}
          onClose={() => setMenuEvent(null)}
          onConfirmTime={onConfirmTime}
          onDelete={() => {
            onDelete(menuEvent.id, selectedDateKey);
            setMenuEvent(null);
          }}
          onModify={() => {
            onModify(menuEvent);
            setMenuEvent(null);
          }}
          selectedDateKey={selectedDateKey}
        />
      )}
      {readOnly && (
        <UserVotePopup
          event={voteEvent}
          onClose={() => setVoteEvent(null)}
          onVote={(time) => {
            if (!voteEvent) return;
            setUserVotes((currentVotes) => ({
              ...currentVotes,
              [getUserVoteKey(voteEvent, selectedDateKey)]: time,
            }));
          }}
          selectedDateKey={selectedDateKey}
          votedTime={voteEvent ? userVotes[getUserVoteKey(voteEvent, selectedDateKey)] : null}
        />
      )}
      <ParticipantsPopup event={participantsEvent} onClose={() => setParticipantsEvent(null)} />
    </View>
  );
}

function GameSelection({ activeGames, onNext, onSelect, selectedGameKey }) {
  const { colors, isDark, t } = useAppTheme();
  return (
    <View style={styles.formStep}>
      <StepIndicator currentStep={1} />
      <Text style={[styles.chooseGameTitle, isDark && { color: colors.text }]}>{t('chooseGame')}</Text>

      <ScrollView
        contentContainerStyle={styles.gameGrid}
        showsVerticalScrollIndicator={false}
        style={styles.gameGridScroll}
      >
        {activeGames.map((game) => {
          const selected = game.key === selectedGameKey;

          return (
            <Pressable
              accessibilityLabel={`${selected ? t('deselect') : t('select')} ${game.name}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={game.key}
              onPress={() => onSelect(selected ? null : game.key)}
              style={({ pressed }) => [
                styles.gameOption,
                isDark && { backgroundColor: colors.card, borderColor: colors.border },
                selected && styles.gameOptionSelected,
                pressed && styles.pressed,
              ]}
            >
              <Image
                resizeMode="contain"
                source={game.image}
                style={[
                  styles.gameOptionImage,
                  { transform: [{ scale: game.imageScale }] },
                ]}
              />
            </Pressable>
          );
        })}
      </ScrollView>

      <PrimaryButton disabled={!selectedGameKey} label={t('next')} onPress={onNext} />
    </View>
  );
}

function RecurringConfiguration({
  allTimes,
  closedDates,
  month,
  onAddTime,
  onMonthChange,
  onNext,
  onToggleClosedDate,
  onToggleTime,
  onToggleWeekday,
  selectedTimes,
  selectedWeekdays,
  year,
}) {
  const { colors, isDark, language, t } = useAppTheme();
  const monthNames = getMonthNames(language);
  const weekdayNames = getWeekdayNames(language);
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [newTimeOpen, setNewTimeOpen] = useState(false);
  const canContinue = selectedWeekdays.length > 0 && selectedTimes.length > 0;

  return (
    <>
      <View style={[styles.recurringPanel, isDark && { backgroundColor: colors.card, borderColor: colors.border }] }>
        <PanelHeading
          subtitle={t('selectMonthDays')}
          title={t('monthlyPlanning')}
        />

        <View style={styles.monthSelectorWrap}>
          <Pressable
            accessibilityLabel={`${t('select')}: ${monthNames[month]}`}
            accessibilityRole="button"
            onPress={() => setMonthMenuOpen(!monthMenuOpen)}
            style={[styles.monthSelector, isDark && { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
          >
            <Text style={[styles.monthSelectorText, isDark && { color: colors.text }]}>{monthNames[month]}</Text>
            <Text style={[styles.monthSelectorArrow, isDark && { color: colors.accent }]}>▼</Text>
          </Pressable>
          {monthMenuOpen && (
            <ScrollView style={[styles.monthMenu, isDark && { backgroundColor: colors.cardAlt }]} nestedScrollEnabled>
              {monthNames.map((monthName, index) => (
                <Pressable
                  accessibilityRole="button"
                  key={monthName}
                  onPress={() => {
                    onMonthChange(index);
                    setMonthMenuOpen(false);
                  }}
                  style={[
                    styles.monthMenuItem,
                    index === month && styles.monthMenuItemSelected,
                    isDark && index === month && { backgroundColor: colors.background },
                  ]}
                >
                  <Text
                    style={[
                      styles.monthMenuText,
                      isDark && { color: colors.text },
                      index === month && styles.monthMenuTextSelected,
                    ]}
                  >
                    {monthName}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.weekdayRow}>
          {weekdayNames.map((day, index) => {
            const selected = selectedWeekdays.includes(index);
            return (
              <Pressable
                accessibilityLabel={`${selected ? t('deselect') : t('select')} ${day}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={day}
                onPress={() => onToggleWeekday(index)}
                style={({ pressed }) => [
                  styles.weekdayChip,
                  isDark && { backgroundColor: colors.cardAlt },
                  selected && styles.weekdayChipSelected,
                  isDark && selected && { backgroundColor: colors.cardAlt },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.weekdayText, isDark && { color: colors.text }, selected && styles.weekdayTextSelected]}>{day}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.closedDaysLabel, isDark && { color: colors.text }]}>{t('closedDays')}</Text>
        <View style={styles.closedDaysRow}>
          {closedDates.slice(0, 3).map((key) => (
            <Pressable
              accessibilityLabel={`${t('delete')} ${formatDate(key, false, language)}`}
              accessibilityRole="button"
              key={key}
              onPress={() => onToggleClosedDate(key)}
              style={[styles.closedDateChip, isDark && { backgroundColor: colors.cardAlt }]}
            >
              <Text style={styles.closedDateText}>{formatDate(key, true, language).slice(0, -3)}</Text>
              <Text style={styles.closedDateRemove}>×</Text>
            </Pressable>
          ))}
          {closedDates.length > 3 && (
            <Text style={styles.moreClosedDates}>+{closedDates.length - 3}</Text>
          )}
          <Pressable
            accessibilityLabel={t('openClosedCalendar')}
            accessibilityRole="button"
            onPress={() => setCalendarOpen(!calendarOpen)}
            style={({ pressed }) => [styles.quickCalendarButton, pressed && styles.pressed]}
          >
            <Text style={styles.quickCalendarPlus}>{calendarOpen ? '−' : '+'}</Text>
          </Pressable>
        </View>

        {calendarOpen && (
          <MiniCalendar
            month={month}
            onToggle={onToggleClosedDate}
            selectedKeys={closedDates}
            selectionKind="closed"
            year={year}
          />
        )}
      </View>

      <View style={[styles.timePanel, isDark && { backgroundColor: colors.card, borderColor: colors.border }] }>
        <PanelHeading
          subtitle={t('weekdaysHint')}
          title={t('pollTime').toUpperCase()}
        />
        <View style={styles.timeGrid}>
          {allTimes.map((time) => (
            <RadioChip
              key={time}
              label={time}
              large
              onPress={() => onToggleTime(time)}
              selected={selectedTimes.includes(time)}
            />
          ))}
        </View>
        {newTimeOpen ? (
          <NewTimeInput onAdd={onAddTime} />
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => setNewTimeOpen(true)}
            style={styles.newOptionButton}
          >
            <Text style={styles.newOptionText}>{t('addTime')}</Text>
          </Pressable>
        )}
      </View>

      <PrimaryButton disabled={!canContinue} label={t('next')} onPress={onNext} />
    </>
  );
}

function OccasionalConfiguration({
  allTimes,
  calendarMonth,
  calendarYear,
  onAddTime,
  onCalendarMonthChange,
  onNext,
  onToggleDate,
  onToggleTime,
  occupiedSlots,
  selectedDates,
  timesByDate,
}) {
  const { colors, isDark, language, t } = useAppTheme();
  const [newTimeOpen, setNewTimeOpen] = useState(false);
  const canContinue =
    selectedDates.length > 0 &&
    selectedDates.every((dateKey) => (timesByDate[dateKey] || []).length > 0);

  return (
    <>
      <View style={[styles.occasionalCalendarPanel, isDark && { backgroundColor: colors.card, borderColor: colors.border }] }>
        <PanelHeading
          subtitle={t('tapCalendarDays')}
          title={t('selectDates')}
        />
        <MiniCalendar
          month={calendarMonth}
          onMonthChange={onCalendarMonthChange}
          onToggle={onToggleDate}
          selectedKeys={selectedDates}
          year={calendarYear}
        />
      </View>

      <View style={[styles.occasionalTimesPanel, isDark && { backgroundColor: colors.card, borderColor: colors.border }] }>
        <PanelHeading
          subtitle={t('timeByDateHint')}
          title={t('timeByDate')}
        />
        {selectedDates.length === 0 ? (
          <Text style={[styles.selectDateHint, isDark && { backgroundColor: colors.cardAlt, color: colors.muted }]}>{t('selectDatesHint')}</Text>
        ) : (
          selectedDates
            .slice()
            .sort()
            .map((dateKey) => (
              <View key={dateKey} style={[styles.dateTimeGroup, isDark && { backgroundColor: colors.cardAlt }]}>
                <Text style={[styles.dateTimeTitle, isDark && { color: colors.text }]}>{formatDate(dateKey, false, language)}</Text>
                <View style={styles.timeGrid}>
                  {allTimes.map((time) => {
                    const unavailable = (occupiedSlots[dateKey] || []).includes(time);
                    return (
                      <RadioChip
                        disabled={unavailable}
                        key={`${dateKey}-${time}`}
                        label={unavailable ? `${time} · ${t('occupied')}` : time}
                        large
                        onPress={() => onToggleTime(dateKey, time)}
                        selected={(timesByDate[dateKey] || []).includes(time)}
                        unavailable={unavailable}
                      />
                    );
                  })}
                </View>
              </View>
            ))
        )}

        {selectedDates.length > 0 &&
          (newTimeOpen ? (
            <NewTimeInput onAdd={onAddTime} />
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => setNewTimeOpen(true)}
              style={styles.newOptionButton}
            >
              <Text style={styles.newOptionText}>{t('addTime')}</Text>
            </Pressable>
          ))}
      </View>

      <PrimaryButton disabled={!canContinue} label={t('next')} onPress={onNext} />
    </>
  );
}

function ConfigurationStep(props) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  return (
    <ScrollView
      contentContainerStyle={styles.configurationContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StepIndicator currentStep={2} />
      <Dropdown
        onSelect={props.onTypeChange}
        open={typeMenuOpen}
        options={EVENT_TYPES}
        selected={props.eventType}
        setOpen={setTypeMenuOpen}
      />

      {props.eventType === 'Ricorrente' ? (
        <RecurringConfiguration {...props} />
      ) : (
        <OccasionalConfiguration {...props} />
      )}
    </ScrollView>
  );
}

function ExpiryStep({ customExpiry, eventType, expiry, onConfirm, onCustomExpiryChange, onExpiryChange }) {
  const { colors, isDark, t } = useAppTheme();
  const customSelected = expiry === 'Personalizzata';
  const expiryRequired = eventType === 'Ricorrente';
  const canConfirm = !expiryRequired || Boolean(expiry);

  return (
    <View style={styles.expiryStep}>
      <StepIndicator currentStep={3} />
      <Text style={[styles.expiryTitle, isDark && { color: colors.text }]}>{t('expiryPoll')}</Text>

      <View style={[styles.expiryPanel, isDark && { backgroundColor: colors.card }] }>
        <View style={styles.expiryOptionsRow}>
          {EXPIRY_OPTIONS.map((option) => (
            <RadioChip
              compact
              key={option}
              label={option}
              onPress={() => onExpiryChange(expiry === option ? null : option)}
              selected={expiry === option}
            />
          ))}
        </View>

        <View style={styles.customExpiryRow}>
          <Pressable
            accessibilityLabel={t('customizeDeadline')}
            accessibilityRole="button"
            accessibilityState={{ selected: customSelected }}
            onPress={() => onExpiryChange(customSelected ? null : 'Personalizzata')}
            style={[
              styles.radioCircle,
              customSelected && styles.radioCircleSelected,
            ]}
          />
          {customSelected ? (
            <View style={styles.customExpiryInputWrap}>
              <TextInput
                accessibilityLabel={t('customDeadlineHours')}
                keyboardType="number-pad"
                onChangeText={onCustomExpiryChange}
                placeholder={t('hours')}
                placeholderTextColor="#A9AFB9"
                style={[styles.customExpiryInput, isDark && { backgroundColor: colors.cardAlt, color: colors.text }]}
                value={customExpiry}
              />
              <Text style={[styles.customExpiryUnit, isDark && { color: colors.muted }]}>{t('hoursBefore')}</Text>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => onExpiryChange('Personalizzata')}
              style={[styles.customExpiryButton, isDark && { backgroundColor: colors.cardAlt }]}
            >
              <Text style={styles.customExpiryButtonText}>{t('customizeTime')}</Text>
            </Pressable>
          )}
        </View>

        {eventType === 'Occasionale' && (
          <Text style={styles.optionalExpiryText}>{t('expiryOptional')}</Text>
        )}
      </View>

      <PrimaryButton
        disabled={!canConfirm || (customSelected && !customExpiry.trim())}
        label={t('confirm')}
        onPress={onConfirm}
      />
    </View>
  );
}

export default function Events({ activeGameKeys, navigation }) {
  const { colors, isDark } = useAppTheme();
  const { isUser } = useAuth();
  const { events: storedEvents, initializeEvents, setEvents } = useEventStore();
  const today = new Date();
  const initialEvents = useMemo(() => [createDemoEvent()], []);
  const events = storedEvents ?? initialEvents;
  const activeGames = useMemo(() => {
    if (!activeGameKeys) {
      return EVENT_GAMES;
    }
    return EVENT_GAMES.filter((game) => activeGameKeys.has(game.key));
  }, [activeGameKeys]);

  const [mode, setMode] = useState('list');
  const [step, setStep] = useState(1);
  const [selectedGameKey, setSelectedGameKey] = useState(null);
  const [eventType, setEventType] = useState('Ricorrente');
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear] = useState(today.getFullYear());
  const [selectedWeekdays, setSelectedWeekdays] = useState([]);
  const [closedDates, setClosedDates] = useState([]);
  const [allTimes, setAllTimes] = useState(DEFAULT_TIMES);
  const [recurringTimes, setRecurringTimes] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  const [timesByDate, setTimesByDate] = useState({});
  const [expiry, setExpiry] = useState(null);
  const [customExpiry, setCustomExpiry] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [now, setNow] = useState(Date.now());
  const occupiedSlots = useMemo(
    () => collectOccupiedSlots(events.filter((event) => event.id !== editingEventId)),
    [editingEventId, events],
  );

  useEffect(() => {
    initializeEvents(initialEvents);
  }, [initialEvents, initializeEvents]);

  useEffect(() => {
    if (selectedGameKey && !activeGames.some((game) => game.key === selectedGameKey)) {
      setSelectedGameKey(null);
    }
  }, [activeGames, selectedGameKey]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const resetForm = () => {
    setStep(1);
    setSelectedGameKey(null);
    setEventType('Ricorrente');
    setSelectedMonth(today.getMonth());
    setSelectedWeekdays([]);
    setClosedDates([]);
    setAllTimes(DEFAULT_TIMES);
    setRecurringTimes([]);
    setCalendarMonth(today.getMonth());
    setCalendarYear(today.getFullYear());
    setSelectedDates([]);
    setTimesByDate({});
    setExpiry(null);
    setCustomExpiry('');
    setEditingEventId(null);
  };

  const startCreating = () => {
    if (isUser) {
      return;
    }
    resetForm();
    setMode('create');
  };

  const handleBack = () => {
    if (mode === 'create') {
      if (step > 1) {
        setStep((currentStep) => currentStep - 1);
      } else {
        setMode('list');
      }
      return;
    }

    const parentNavigation = navigation.getParent();
    if (parentNavigation?.canGoBack()) {
      parentNavigation.goBack();
    }
  };

  const changeType = (nextType) => {
    setEventType(nextType);
    setExpiry(null);
    setCustomExpiry('');
  };

  const changeRecurringMonth = (month) => {
    setSelectedMonth(month);
    setClosedDates([]);
  };

  const addTimeOption = (time) => {
    if (!allTimes.includes(time)) {
      setAllTimes((currentTimes) => [...currentTimes, time].sort());
    }
  };

  const toggleOccasionalDate = (dateKey) => {
    setSelectedDates((currentDates) => toggleArrayValue(currentDates, dateKey));
    setTimesByDate((currentTimes) => {
      if (currentTimes[dateKey]) {
        const nextTimes = { ...currentTimes };
        delete nextTimes[dateKey];
        return nextTimes;
      }
      return { ...currentTimes, [dateKey]: [] };
    });
  };

  const toggleOccasionalTime = (dateKey, time) => {
    if ((occupiedSlots[dateKey] || []).includes(time)) {
      return;
    }
    setTimesByDate((currentTimes) => ({
      ...currentTimes,
      [dateKey]: toggleArrayValue(currentTimes[dateKey] || [], time),
    }));
  };

  const moveOccasionalMonth = (year, month) => {
    setCalendarYear(year);
    setCalendarMonth(month);
  };

  const modifyEvent = (event) => {
    resetForm();
    setEditingEventId(event.id);
    setSelectedGameKey(event.game.key);
    setEventType(event.type);

    if (event.type === 'Ricorrente') {
      setSelectedMonth(event.schedule.month);
      setSelectedWeekdays([...event.schedule.weekdays]);
      setClosedDates([...event.schedule.closedDates]);
      setRecurringTimes([...event.schedule.times]);
      setAllTimes(Array.from(new Set([...DEFAULT_TIMES, ...event.schedule.times])).sort());
    } else {
      const eventDateKeys = Object.keys(event.schedule.timesByDate).sort();
      const eventTimes = Object.values(event.schedule.timesByDate).flat();
      setSelectedDates(eventDateKeys);
      setTimesByDate(
        Object.fromEntries(
          Object.entries(event.schedule.timesByDate).map(([dateKey, times]) => [dateKey, [...times]]),
        ),
      );
      setAllTimes(Array.from(new Set([...DEFAULT_TIMES, ...eventTimes])).sort());
      if (eventDateKeys.length > 0) {
        const firstDate = readDateKey(eventDateKeys[0]);
        setCalendarMonth(firstDate.month);
        setCalendarYear(firstDate.year);
      }
    }

    if (EXPIRY_OPTIONS.includes(event.expiry)) {
      setExpiry(event.expiry);
    } else if (event.expiry) {
      setExpiry('Personalizzata');
      setCustomExpiry(String(event.expiry).replace(/H$/i, ''));
    }

    setStep(2);
    setMode('create');
  };

  const confirmEvent = () => {
    const game = EVENT_GAMES.find((item) => item.key === selectedGameKey);
    if (!game) {
      return;
    }

    const detail = eventType === 'Ricorrente'
      ? `${MONTHS[selectedMonth]} · ${selectedWeekdays.map((day) => WEEKDAYS[day]).join(', ')} · ${recurringTimes.join(', ')}`
      : selectedDates
          .slice()
          .sort()
          .map((dateKey) => `${formatDate(dateKey, true)} · ${(timesByDate[dateKey] || []).join(', ')}`)
          .join(' | ');

    const schedule = eventType === 'Ricorrente'
      ? {
          closedDates: [...closedDates],
          month: selectedMonth,
          times: [...recurringTimes],
          weekdays: [...selectedWeekdays],
          year: selectedYear,
        }
      : {
          timesByDate: Object.fromEntries(
            Object.entries(timesByDate).map(([dateKey, times]) => [dateKey, [...times]]),
          ),
        };
    const dateKeys = eventType === 'Ricorrente'
      ? buildRecurringDateKeys(selectedYear, selectedMonth, selectedWeekdays, closedDates)
      : [...selectedDates].sort();
    const eventTimes = eventType === 'Ricorrente'
      ? recurringTimes
      : Array.from(new Set(Object.values(timesByDate).flat()));
    const expiryHours = getExpiryHours(expiry, customExpiry);
    const existingEvent = events.find((event) => event.id === editingEventId);
    const existingConfirmedTimesByDate = Object.fromEntries(
      Object.entries(existingEvent?.confirmedTimesByDate ?? {}).filter(([dateKey, time]) => {
        if (!dateKeys.includes(dateKey)) {
          return false;
        }
        return eventType === 'Ricorrente'
          ? eventTimes.includes(time)
          : (schedule.timesByDate[dateKey] ?? []).includes(time);
      }),
    );
    const nextEvent = {
      confirmedTimesByDate: existingConfirmedTimesByDate,
      dateKeys,
      detail,
      expiry: expiry === 'Personalizzata' ? `${customExpiry}H` : expiry,
      expiryHours,
      game,
      id: editingEventId ?? `${Date.now()}-${events.length}`,
      participants: existingEvent?.participants ?? [],
      pollOptions: makePollOptions(eventTimes),
      schedule,
      type: eventType,
    };

    setEvents((currentEvents) => editingEventId
      ? currentEvents.map((event) => (event.id === editingEventId ? nextEvent : event))
      : [...currentEvents, nextEvent]);
    setMode('list');
    resetForm();
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.pageFrame}>
        <View style={styles.pageContent}>
          <AppHeader onBack={handleBack} />

          {mode === 'list' ? (
            <EventsList
              events={events}
              now={now}
              onConfirmTime={(eventId, dateKey, time) => setEvents((currentEvents) =>
                currentEvents.map((event) =>
                  event.id === eventId
                    ? {
                        ...event,
                        confirmedTimesByDate: {
                          ...(event.confirmedTimesByDate ?? {}),
                          [dateKey]: time,
                        },
                      }
                    : event))}
              onCreate={startCreating}
              onDelete={(eventId, dateKey) => setEvents((currentEvents) =>
                removeEventOccurrence(currentEvents, eventId, dateKey))}
              onModify={modifyEvent}
              readOnly={isUser}
            />
          ) : step === 1 ? (
            <GameSelection
              activeGames={activeGames}
              onNext={() => setStep(2)}
              onSelect={setSelectedGameKey}
              selectedGameKey={selectedGameKey}
            />
          ) : step === 2 ? (
            <ConfigurationStep
              allTimes={allTimes}
              calendarMonth={calendarMonth}
              calendarYear={calendarYear}
              closedDates={closedDates}
              eventType={eventType}
              month={selectedMonth}
              onAddTime={addTimeOption}
              onCalendarMonthChange={moveOccasionalMonth}
              onMonthChange={changeRecurringMonth}
              onNext={() => setStep(3)}
              onToggleClosedDate={(dateKey) => setClosedDates((dates) => toggleArrayValue(dates, dateKey))}
              onToggleDate={toggleOccasionalDate}
              onToggleTime={eventType === 'Ricorrente'
                ? (time) => setRecurringTimes((times) => toggleArrayValue(times, time))
                : toggleOccasionalTime}
              onToggleWeekday={(day) => setSelectedWeekdays((days) => toggleArrayValue(days, day))}
              onTypeChange={changeType}
              occupiedSlots={occupiedSlots}
              selectedDates={selectedDates}
              selectedTimes={recurringTimes}
              selectedWeekdays={selectedWeekdays}
              timesByDate={timesByDate}
              year={selectedYear}
            />
          ) : (
            <ExpiryStep
              customExpiry={customExpiry}
              eventType={eventType}
              expiry={expiry}
              onConfirm={confirmEvent}
              onCustomExpiryChange={setCustomExpiry}
              onExpiryChange={setExpiry}
            />
          )}
        </View>
      </View>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BACKGROUND,
  },
  pageFrame: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  pageContent: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  listScreen: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 14,
  },
  weekCalendarCard: {
    width: '100%',
    padding: 11,
    borderRadius: 22,
    backgroundColor: '#fff',
    shadowColor: '#1D3159',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 4,
  },
  weekCalendarHeader: {
    height: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekNavButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: BLUE,
  },
  weekNavText: {
    marginTop: -3,
    color: '#fff',
    fontSize: 31,
    fontWeight: '600',
    lineHeight: 34,
  },
  weekCalendarHeading: {
    alignItems: 'center',
  },
  weekCalendarMonth: {
    color: BLUE,
    fontSize: 17,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  weekCalendarNumber: {
    marginTop: 1,
    color: '#9CA5B5',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  weekDaysRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 9,
  },
  weekDay: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 15,
    backgroundColor: '#F1F3F7',
  },
  weekDaySelected: {
    borderColor: YELLOW,
    backgroundColor: BLUE,
  },
  weekDayLabel: {
    color: '#8590A3',
    fontSize: 9,
    fontWeight: '900',
  },
  weekDayLabelSelected: {
    color: '#fff',
  },
  weekDayNumber: {
    marginTop: 1,
    color: DARK_BLUE,
    fontSize: 17,
    fontWeight: '900',
  },
  weekDayNumberSelected: {
    color: '#fff',
  },
  weekEventDot: {
    width: 5,
    height: 5,
    marginTop: 2,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  weekEventDotVisible: {
    backgroundColor: YELLOW,
  },
  eventsList: {
    width: '100%',
    marginTop: 13,
  },
  eventsListContent: {
    flexGrow: 1,
    gap: 10,
    paddingBottom: 15,
  },
  emptyEventsText: {
    marginTop: 32,
    color: BLUE,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  eventSummaryCard: {
    width: '100%',
    height: 140,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 0,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  userEventSummaryCard: {
    width: '100%',
    height: 82,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  userEventSummaryMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 7,
  },
  userEventSummaryLogo: {
    width: 43,
    height: 56,
    marginRight: 11,
  },
  userEventSummaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  userEventSummaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
  },
  userEventSummaryDate: {
    flexShrink: 1,
    color: BLUE,
    fontSize: 16,
    fontWeight: '900',
  },
  userEventDateGroup: {
    flex: 1,
    minWidth: 0,
  },
  userEventType: {
    marginTop: 1,
    color: '#6582C4',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  userEventTypeOccasional: {
    color: '#C46E6B',
  },
  userEventSummaryCountdown: {
    color: '#A5372E',
    fontSize: 19,
    fontWeight: '900',
  },
  userEventSummaryBottomRow: {
    minHeight: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
  },
  userEventStartBlock: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0,
  },
  userEventStartLabel: {
    color: '#6582C4',
    fontSize: 10,
    fontWeight: '900',
  },
  userEventStartTime: {
    color: '#2EBC59',
    fontSize: 14,
    fontWeight: '900',
  },
  userVoteButton: {
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderRadius: 11,
    backgroundColor: '#F5C330',
  },
  userVoteButtonText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  userVoteResult: {
    flexShrink: 1,
    alignItems: 'flex-start',
  },
  userVoteResultLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userVotedLabel: {
    color: '#6582C4',
    fontSize: 9,
    fontWeight: '900',
  },
  userVotedTime: {
    color: '#2EAEB5',
    fontSize: 10,
    fontWeight: '900',
  },
  userModifyVote: {
    marginTop: 1,
    color: '#A1A8B4',
    fontSize: 10,
    fontWeight: '800',
  },
  userPlayersPanel: {
    position: 'relative',
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPlayersCurve: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  userPlayersPressable: {
    zIndex: 1,
    minWidth: 62,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  userPlayersPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
  },
  userPlayersValue: {
    color: '#fff',
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 32,
  },
  userPlayersLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  eventSummaryBackground: {
    position: 'absolute',
    top: 0,
    right: 34,
    bottom: 0,
    left: 0,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  eventSummaryMain: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    alignItems: 'stretch',
    paddingLeft: 10,
    paddingVertical: 8,
  },
  eventSummaryTopRow: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 91,
  },
  eventSummaryLogo: {
    position: 'absolute',
    top: 35,
    left: 10,
    width: 82,
    height: 70,
  },
  eventSummaryCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 7,
  },
  eventSummaryHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
  eventSummaryHeadingCopy: {
    flex: 1,
    minWidth: 0,
  },
  eventSummaryType: {
    color: '#9AA4B7',
    fontSize: 10,
    fontWeight: '800',
  },
  eventSummaryTitle: {
    color: BLUE,
    fontSize: 17,
    fontWeight: '900',
  },
  eventSummaryDetail: {
    marginTop: 5,
    color: BLUE,
    fontSize: 12,
    fontWeight: '900',
  },
  eventSummaryDetailConfirmed: {
    color: '#2DAA6F',
  },
  eventMenuButton: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#EEF1F6',
  },
  eventMenuIcon: {
    marginTop: -2,
    color: BLUE,
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 24,
  },
  eventTimeoutRow: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 5,
    paddingLeft: 91,
  },
  eventNoDeadline: {
    color: '#B74D49',
    fontSize: 13,
    fontWeight: '900',
  },
  countdownDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  countdownChunk: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  countdownUnit: {
    minWidth: 31,
    alignItems: 'center',
  },
  countdownNumber: {
    color: '#B74D49',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  countdownLabel: {
    marginTop: 1,
    color: '#C86561',
    fontSize: 7,
    fontWeight: '900',
    lineHeight: 9,
  },
  countdownColon: {
    marginHorizontal: 2,
    color: '#B74D49',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  eventParticipantsArea: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  eventParticipantsCurve: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  eventParticipantsContent: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 22,
  },
  eventParticipantsNumberButton: {
    minWidth: 48,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantsNumberPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.92 }],
  },
  eventParticipantsValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 34,
  },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(36, 42, 53, 0.25)',
  },
  modalDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  eventManagementPopup: {
    zIndex: 2,
    width: '91%',
    maxWidth: 390,
    maxHeight: '82%',
    alignItems: 'center',
    paddingHorizontal: 27,
    paddingTop: 28,
    paddingBottom: 24,
    borderRadius: 25,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.27,
    shadowRadius: 12,
    elevation: 12,
  },
  eventPopupClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 4,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#CB6A69',
  },
  eventPopupCloseText: {
    marginTop: -3,
    color: '#fff',
    fontSize: 31,
    fontWeight: '300',
    lineHeight: 34,
  },
  eventPopupLogoFrame: {
    width: '76%',
    height: 94,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventPopupLogo: {
    width: '100%',
    height: '100%',
  },
  eventPopupFormat: {
    marginTop: -2,
    marginBottom: 20,
    color: '#C56565',
    fontSize: 11,
    fontWeight: '900',
  },
  pollOptionsScroll: {
    width: '100%',
    maxHeight: 230,
  },
  pollOptionsList: {
    gap: 11,
    paddingVertical: 3,
  },
  pollOptionRow: {
    width: '100%',
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pollRadio: {
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: BLUE,
    borderRadius: 10,
    backgroundColor: '#EEF0F2',
  },
  pollTime: {
    width: 78,
    marginLeft: 8,
    color: BLUE,
    fontSize: 19,
    fontWeight: '900',
  },
  adminOccasionalPollLabel: {
    flex: 1,
    width: 'auto',
    fontSize: 16,
  },
  pollPercentage: {
    width: 58,
    fontSize: 17,
    fontWeight: '900',
  },
  pollParticipantsCount: {
    marginLeft: 'auto',
    marginRight: 5,
    color: BLUE,
    fontSize: 16,
    fontWeight: '900',
  },
  pollUsersIconBadge: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: BLUE,
  },
  timeConfirmationPanel: {
    width: '100%',
    alignItems: 'center',
    gap: 9,
    paddingTop: 8,
    paddingBottom: 4,
  },
  timeConfirmationCheck: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: '#2DAA6F',
  },
  timeConfirmationCheckText: {
    color: '#fff',
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 36,
  },
  timeConfirmationTitle: {
    color: '#2DAA6F',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  timeConfirmationDate: {
    color: '#2DAA6F',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  timeConfirmationMessage: {
    marginBottom: 15,
    color: DARK_BLUE,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  eventPopupActions: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginTop: 25,
  },
  popupActionButton: {
    width: 165,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  popupConfirmButton: {
    backgroundColor: '#2DAA81',
  },
  popupConfirmButtonDisabled: {
    opacity: 0.4,
  },
  popupModifyButton: {
    backgroundColor: '#5478C1',
  },
  popupDeleteButton: {
    backgroundColor: '#913E3E',
  },
  popupActionText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '900',
  },
  userVoteConfirmText: {
    fontSize: 15,
    textAlign: 'center',
  },
  userVotePopup: {
    zIndex: 2,
    width: '90%',
    maxWidth: 370,
    maxHeight: '78%',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 27,
    paddingTop: 28,
    paddingBottom: 25,
    borderRadius: 25,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.27,
    shadowRadius: 12,
    elevation: 12,
  },
  userOccasionalVotePopup: {
    maxHeight: '84%',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 23,
  },
  userVotePopupLogo: {
    width: '75%',
    height: 82,
  },
  userVotePopupTitle: {
    color: BLUE,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  userVoteOptionsScroll: {
    width: '100%',
    maxHeight: 220,
  },
  userOccasionalVoteOptionsScroll: {
    maxHeight: 410,
  },
  userOccasionalVoteTitle: {
    color: BLUE,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  userOccasionalChoiceRow: {
    width: '100%',
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  userOccasionalChoiceRadio: {
    width: 29,
    height: 29,
    borderWidth: 4,
    borderColor: '#2C56A8',
    borderRadius: 15,
    backgroundColor: '#EEF0F2',
  },
  userOccasionalChoiceRadioSelected: {
    backgroundColor: YELLOW,
  },
  userOccasionalChoiceText: {
    flex: 1,
    marginLeft: 15,
    color: '#2C56A8',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
  },
  userAbsentVoteRow: {
    marginTop: 3,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#D9DDE5',
  },
  userAbsentVoteRadio: {
    borderColor: '#C46E6B',
  },
  userAbsentVoteRadioSelected: {
    backgroundColor: '#C46E6B',
  },
  userAbsentVoteText: {
    flex: 1,
    marginLeft: 8,
    color: '#C46E6B',
    fontSize: 18,
    fontWeight: '900',
  },
  userOccasionalAbsentText: {
    marginLeft: 15,
    fontSize: 24,
    lineHeight: 29,
  },
  participantsPopup: {
    zIndex: 2,
    width: '94%',
    maxWidth: 410,
    height: '78%',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderRadius: 25,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.27,
    shadowRadius: 12,
    elevation: 12,
  },
  participantsPopupLogo: {
    width: 165,
    height: 85,
  },
  participantsPopupTitle: {
    marginTop: 4,
    marginBottom: 20,
    color: '#878181',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  participantsScroll: {
    flex: 1,
    width: '100%',
  },
  participantsList: {
    gap: 13,
    paddingBottom: 8,
  },
  participantCard: {
    width: '100%',
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: '#F4EDEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
  participantAvatar: {
    width: 43,
    height: 43,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: BLUE,
    borderRadius: 22,
  },
  participantAvatarHead: {
    width: 13,
    height: 13,
    marginTop: 7,
    borderRadius: 7,
    backgroundColor: BLUE,
  },
  participantAvatarBody: {
    width: 30,
    height: 18,
    marginTop: 3,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: BLUE,
  },
  participantCopy: {
    flex: 1,
  },
  participantName: {
    color: '#878181',
    fontSize: 15,
    fontWeight: '900',
  },
  participantId: {
    marginTop: 1,
    color: '#969092',
    fontSize: 11,
    fontWeight: '600',
  },
  noParticipantsText: {
    marginTop: 35,
    color: '#9993A0',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  createEventButton: {
    width: '85%',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 9,
    borderRadius: 17,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },
  createEventPlusCircle: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#5577C1',
  },
  createEventPlus: {
    marginTop: -4,
    color: '#fff',
    fontSize: 39,
    fontWeight: '300',
    lineHeight: 42,
  },
  createEventText: {
    color: '#5577C1',
    fontSize: 16,
    fontWeight: '900',
  },
  formStep: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  stepIndicator: {
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepLine: {
    width: 30,
    height: 3,
    backgroundColor: BLUE,
  },
  stepLineActive: {
    backgroundColor: BLUE,
  },
  stepCircle: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: BLUE,
    borderRadius: 22,
    backgroundColor: PAGE_BACKGROUND,
  },
  stepCircleCurrent: {
    backgroundColor: BLUE,
  },
  stepCircleComplete: {
    backgroundColor: '#EEF1F7',
  },
  stepNumber: {
    color: '#6680BB',
    fontSize: 20,
    fontWeight: '900',
  },
  stepNumberCurrent: {
    color: '#fff',
  },
  stepNumberComplete: {
    color: BLUE,
  },
  chooseGameTitle: {
    marginBottom: 19,
    color: BLUE,
    fontSize: 19,
    fontWeight: '900',
  },
  gameGridScroll: {
    width: '100%',
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 10,
    paddingBottom: 16,
  },
  gameOption: {
    width: '47%',
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    borderWidth: 2,
    borderColor: '#D8DDE6',
    borderRadius: 17,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  gameOptionSelected: {
    borderWidth: 4,
    borderColor: BLUE,
    backgroundColor: '#ADF8FF',
  },
  gameOptionImage: {
    width: '100%',
    height: '100%',
  },
  primaryButton: {
    minWidth: 152,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
    paddingHorizontal: 25,
    borderRadius: 22,
    backgroundColor: BLUE,
  },
  primaryButtonDisabled: {
    opacity: 0.38,
  },
  primaryButtonText: {
    color: '#fff',
    fontFamily: 'RubikDirt_400Regular',
    fontSize: 23,
    lineHeight: 27,
  },
  configurationContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 25,
  },
  dropdownWrap: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 22,
  },
  sectionTitle: {
    color: BLUE,
    fontSize: 14,
    fontWeight: '900',
  },
  dropdownButton: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F2F4F8',
    borderRadius: 22,
    backgroundColor: '#fff',
    shadowColor: '#1D3159',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 4,
  },
  dropdownText: {
    color: BLUE,
    fontSize: 19,
    fontWeight: '900',
  },
  dropdownArrow: {
    position: 'absolute',
    right: 18,
    color: YELLOW,
    fontSize: 17,
  },
  dropdownMenu: {
    width: '100%',
    marginTop: 8,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 8,
  },
  dropdownOption: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOptionSelected: {
    backgroundColor: '#EDF1F8',
  },
  dropdownOptionText: {
    color: DARK_BLUE,
    fontSize: 16,
    fontWeight: '800',
  },
  dropdownOptionTextSelected: {
    color: BLUE,
  },
  recurringPanel: {
    width: '100%',
    alignItems: 'center',
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDF0F6',
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#1D3159',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 9,
    elevation: 5,
  },
  panelHeading: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  panelHeadingCopy: {
    flex: 1,
  },
  panelHeadingTitle: {
    color: DARK_BLUE,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  panelHeadingSubtitle: {
    marginTop: 2,
    color: '#929CAD',
    fontSize: 10,
    fontWeight: '700',
  },
  monthSelectorWrap: {
    width: 162,
    marginBottom: 15,
  },
  monthSelector: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE4EF',
    borderRadius: 18,
    backgroundColor: '#F0F3F8',
  },
  monthSelectorText: {
    color: BLUE,
    fontSize: 13,
    fontWeight: '900',
  },
  monthSelectorArrow: {
    position: 'absolute',
    right: 14,
    color: BLUE,
    fontSize: 10,
  },
  monthMenu: {
    width: '100%',
    height: 220,
    marginTop: 7,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 9,
  },
  monthMenuItem: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthMenuItemSelected: {
    backgroundColor: '#EDF1F8',
  },
  monthMenuText: {
    color: DARK_BLUE,
    fontSize: 13,
    fontWeight: '700',
  },
  monthMenuTextSelected: {
    color: BLUE,
    fontWeight: '900',
  },
  weekdayRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
  },
  weekdayChip: {
    minWidth: 39,
    height: 36,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 18,
    backgroundColor: '#EEF1F5',
  },
  weekdayChipSelected: {
    borderColor: YELLOW,
    backgroundColor: '#FFF8DC',
  },
  weekdayText: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '900',
  },
  weekdayTextSelected: {
    color: DARK_BLUE,
  },
  closedDaysLabel: {
    alignSelf: 'flex-start',
    marginTop: 18,
    color: DARK_BLUE,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.25,
  },
  closedDaysRow: {
    width: '100%',
    minHeight: 36,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginTop: 8,
  },
  closedDateChip: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 13,
    paddingRight: 6,
    borderRadius: 16,
    backgroundColor: '#F0F3F8',
  },
  closedDateText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: '900',
  },
  closedDateRemove: {
    width: 20,
    height: 20,
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 19,
    textAlign: 'center',
    borderRadius: 10,
    backgroundColor: '#D77970',
  },
  moreClosedDates: {
    color: BLUE,
    fontSize: 10,
    fontWeight: '900',
  },
  quickCalendarButton: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: YELLOW,
  },
  quickCalendarPlus: {
    marginTop: -2,
    color: BLUE,
    fontSize: 21,
    fontWeight: '900',
  },
  calendar: {
    width: '100%',
    marginTop: 12,
    paddingHorizontal: 9,
    paddingTop: 4,
    paddingBottom: 10,
    borderRadius: 18,
    backgroundColor: '#F7F9FC',
  },
  calendarHeader: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarArrowButton: {
    width: 40,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarArrow: {
    color: BLUE,
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 34,
  },
  calendarMonth: {
    color: BLUE,
    fontSize: 15,
    fontWeight: '900',
  },
  calendarWeekRow: {
    flexDirection: 'row',
  },
  calendarWeekday: {
    width: '14.2857%',
    color: '#9EA7B7',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  calendarCell: {
    width: '14.2857%',
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDay: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 16,
  },
  calendarDaySelected: {
    borderColor: YELLOW,
    backgroundColor: BLUE,
  },
  calendarDayClosed: {
    borderColor: '#D77970',
    backgroundColor: '#D77970',
  },
  calendarDayText: {
    color: '#5A6680',
    fontSize: 12,
    fontWeight: '800',
  },
  calendarDayTextSelected: {
    color: '#fff',
  },
  timePanel: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDF0F6',
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#1D3159',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 9,
    elevation: 5,
  },
  timeGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 12,
  },
  radioChip: {
    width: '50%',
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  radioChipUnavailable: {
    opacity: 0.48,
  },
  radioChipCompact: {
    width: 'auto',
    flex: 1,
    gap: 5,
    paddingHorizontal: 2,
  },
  radioChipLarge: {
    minHeight: 34,
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 7,
  },
  radioCircle: {
    width: 19,
    height: 19,
    borderWidth: 3,
    borderColor: BLUE,
    borderRadius: 10,
    backgroundColor: '#ECEEEF',
  },
  radioCircleSelected: {
    backgroundColor: YELLOW,
  },
  radioCircleLarge: {
    width: 23,
    height: 23,
    borderRadius: 12,
  },
  radioCircleUnavailable: {
    borderColor: '#9CA3AE',
    backgroundColor: '#D0D3D8',
  },
  radioLabel: {
    flexShrink: 1,
    color: BLUE,
    fontSize: 11,
    fontWeight: '900',
  },
  radioLabelLarge: {
    fontSize: 14,
  },
  radioLabelUnavailable: {
    color: '#747B87',
    fontSize: 9,
  },
  newOptionButton: {
    marginTop: 13,
    padding: 6,
  },
  newOptionText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  newTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 13,
  },
  newTimeInput: {
    width: 96,
    height: 38,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#DDE1E8',
    borderRadius: 19,
    color: BLUE,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    outlineStyle: 'none',
  },
  newTimeAdd: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: BLUE,
  },
  newTimeAddDisabled: {
    opacity: 0.35,
  },
  newTimeAddText: {
    marginTop: -3,
    color: '#fff',
    fontSize: 28,
    lineHeight: 31,
  },
  occasionalCalendarPanel: {
    width: '100%',
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDF0F6',
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#1D3159',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 9,
    elevation: 5,
  },
  occasionalTimesPanel: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDF0F6',
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#1D3159',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 9,
    elevation: 5,
  },
  selectDateHint: {
    width: '100%',
    marginVertical: 16,
    paddingVertical: 18,
    borderRadius: 15,
    backgroundColor: '#F5F7FA',
    color: '#9AA4B7',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  dateTimeGroup: {
    width: '100%',
    padding: 13,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: YELLOW,
    borderRadius: 16,
    backgroundColor: '#F6F8FC',
  },
  dateTimeTitle: {
    marginBottom: 12,
    color: DARK_BLUE,
    fontSize: 14,
    fontWeight: '900',
  },
  expiryStep: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  expiryTitle: {
    marginTop: 22,
    marginBottom: 17,
    color: BLUE,
    fontSize: 16,
    fontWeight: '900',
  },
  expiryPanel: {
    width: '88%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  expiryOptionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customExpiryRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 13,
  },
  customExpiryButton: {
    minHeight: 26,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#E1E4E8',
  },
  customExpiryButtonText: {
    color: '#AEB4C0',
    fontSize: 10,
    fontWeight: '900',
  },
  customExpiryInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customExpiryInput: {
    width: 58,
    height: 31,
    paddingHorizontal: 7,
    borderWidth: 2,
    borderColor: '#DDE1E8',
    borderRadius: 15,
    color: BLUE,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    outlineStyle: 'none',
  },
  customExpiryUnit: {
    color: BLUE,
    fontSize: 10,
    fontWeight: '800',
  },
  optionalExpiryText: {
    marginTop: 8,
    color: '#A5ACB8',
    fontSize: 9,
    fontWeight: '700',
  },
});
