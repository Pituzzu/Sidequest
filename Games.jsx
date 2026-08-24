import { BlurTargetView, BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from './AppHeader';
import { useAppTheme } from './ThemeContext';
import AutumnIcon from './assets/autunno.svg';
import SummerIcon from './assets/estate.svg';
import WinterIcon from './assets/inverno.svg';
import SpringIcon from './assets/primavera.svg';

const GAMES = [
  {
    key: 'yugioh',
    name: 'Yu-Gi-Oh!',
    icon: require('./assets/copertine_giochi/yugioh.png'),
    gridScale: 1.3,
    leagueLogo: require('./assets/lega_yugioh.png'),
    logoHeight: 74,
    logoWidth: 123,
  },
  {
    key: 'pokemon',
    name: 'Pokémon',
    icon: require('./assets/copertine_giochi/pokemon.png'),
    gridScale: 1.35,
    logoHeight: 82,
    logoWidth: 147,
  },
  {
    key: 'onepiece',
    name: 'One Piece',
    icon: require('./assets/copertine_giochi/onepiece.png'),
    gridScale: 1.85,
    logoHeight: 130,
    logoWidth: 127,
  },
  {
    key: 'beyblade',
    name: 'Beyblade',
    icon: require('./assets/copertine_giochi/beyblade.png'),
    gridScale: 1,
    logoHeight: 46,
    logoWidth: 144,
  },
  {
    key: 'yugioh_edison',
    name: 'Yu-Gi-Oh! Edison',
    icon: require('./assets/copertine_giochi/yugioh_edison.png'),
    gridScale: 1.04,
    logoHeight: 45,
    logoWidth: 105,
  },
  {
    key: 'pokemon_champions',
    name: 'Pokémon Champions',
    icon: require('./assets/copertine_giochi/pokemon_champions.png'),
    gridScale: 1.15,
    logoHeight: 52,
    logoWidth: 87,
  },
  {
    key: 'magic',
    name: 'Magic: The Gathering',
    icon: require('./assets/copertine_giochi/magic.png'),
    gridScale: 1,
    logoHeight: 53,
    logoWidth: 139,
  },
  {
    key: 'naruto',
    name: 'Naruto',
    icon: require('./assets/copertine_giochi/naruto.png'),
    gridScale: 1.75,
    logoHeight: 99,
    logoWidth: 99,
  },
  {
    key: 'dnd',
    name: 'Dungeons & Dragons',
    icon: require('./assets/copertine_giochi/dnd.png'),
    gridScale: 1.8,
    logoHeight: 137,
    logoWidth: 137,
  },
  {
    key: 'lorcana',
    name: 'Disney Lorcana',
    icon: require('./assets/copertine_giochi/lorcana.png'),
    gridScale: 1.2,
    logoHeight: 60,
    logoWidth: 125,
  },
  {
    key: 'riftbound',
    name: 'Riftbound',
    icon: require('./assets/copertine_giochi/riftbound.png'),
    gridScale: 1.55,
    logoHeight: 91,
    logoWidth: 107,
  },
];

export const INITIAL_ACTIVE_GAMES = [
  'yugioh',
  'pokemon',
  'onepiece',
  'beyblade',
  'yugioh_edison',
  'pokemon_champions',
];

const LEAGUE_PARTICIPANTS = [
  { id: 'u1', memberId: '12345678', username: 'Marco Rossi' },
  { id: 'u2', memberId: '27481936', username: 'Giulia Bianchi' },
  { id: 'u3', memberId: '39572014', username: 'Luca Romano' },
  { id: 'u4', memberId: '48613579', username: 'Sara Esposito' },
  { id: 'u5', memberId: '51729463', username: 'Andrea Conti' },
  { id: 'u6', memberId: '62840571', username: 'Elena Ricci' },
  { id: 'u7', memberId: '73951682', username: 'Matteo Costa' },
  { id: 'u8', memberId: '84062793', username: 'Chiara Gallo' },
  { id: 'u9', memberId: '95173824', username: 'Davide Ferri' },
  { id: 'u10', memberId: '16284935', username: 'Francesca Villa' },
  { id: 'u11', memberId: '27395046', username: 'Simone Greco' },
  { id: 'u12', memberId: '38406157', username: 'Valentina Serra' },
];

const LEAGUE_YEARS = [2030, 2029, 2028, 2027, 2026];

const SEASONS = [
  { color: '#3159AD', Icon: WinterIcon, key: 'winter' },
  { color: '#C12F78', Icon: SpringIcon, key: 'spring' },
  { color: '#D98D36', Icon: SummerIcon, key: 'summer' },
  { color: '#963E3E', Icon: AutumnIcon, key: 'autumn' },
];

const RANK_COLORS = ['#B99122', '#A7A7A7', '#B57B55'];

function SearchBar({ onChangeText, value }) {
  const { colors, isDark, t } = useAppTheme();
  return (
    <View style={styles.searchRow}>
      <TextInput
        accessibilityLabel={t('searchGame')}
        onChangeText={onChangeText}
        placeholder={t('searchGame')}
        placeholderTextColor="#E4E7EE"
        returnKeyType="search"
        style={[styles.searchInput, isDark && { backgroundColor: colors.card, color: colors.text }]}
        value={value}
      />
      <Pressable
        accessibilityLabel={t('search')}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.searchButton,
          pressed && styles.searchButtonPressed,
        ]}
      >
        <Text style={styles.searchButtonText}>{t('search')}</Text>
      </Pressable>
    </View>
  );
}

function GameChip({ active, game, onPress, selected }) {
  const { colors, isDark, t } = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={`${game.name}, ${active ? t('active') : t('inactive')}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.gameChip,
        isDark && { backgroundColor: colors.card, borderColor: colors.border },
        !active && styles.gameChipInactive,
        selected && styles.gameChipSelected,
        pressed && styles.gameChipPressed,
      ]}
    >
      <View style={styles.gameChipLogoFrame}>
        {game.custom ? (
          <>
            <Image resizeMode="cover" source={game.cover} style={styles.customGameCover} />
            <View style={styles.customGameCoverShade} />
            <View style={styles.customGameIdentity}>
              <View style={styles.customGameLogoWrap}>
                <Image resizeMode="contain" source={game.icon} style={styles.customGameLogo} />
              </View>
              <Text numberOfLines={1} style={styles.customGameName}>{game.name}</Text>
            </View>
          </>
        ) : (
          <Image
            resizeMode="contain"
            source={game.icon}
            style={[
              styles.gameChipLogo,
              {
                height: game.logoHeight * 1.18,
                transform: [{ scale: game.gridScale ?? 1 }],
                width: game.logoWidth * 1.18,
              },
            ]}
          />
        )}
      </View>
    </Pressable>
  );
}

function GamesPopup({ active, blurTarget, game, onClose, onLeague, onToggle }) {
  const { colors, isDark, t } = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={t('close')}
      onPress={onClose}
      style={styles.popupBackdrop}
    >
      <BlurView
        blurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        blurReductionFactor={3}
        blurTarget={blurTarget}
        intensity={55}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        tint="light"
      />
      <View pointerEvents="none" style={styles.popupShade} />

      <Pressable
        accessibilityRole="dialog"
        onPress={(event) => event.stopPropagation()}
        style={[styles.popupCard, isDark && { backgroundColor: colors.card }]}
      >
        <Pressable
          accessibilityLabel={t('close')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [
            styles.popupClose,
            pressed && styles.popupClosePressed,
          ]}
        >
          <Text style={styles.popupCloseText}>×</Text>
        </Pressable>

        <View style={styles.popupLogoFrame}>
          <Image
            accessibilityLabel={game.name}
            resizeMode="contain"
            source={game.icon}
            style={[
              styles.popupLogo,
              {
                height: game.logoHeight * 1.45,
                width: game.logoWidth * 1.45,
              },
            ]}
          />
        </View>

        <View style={styles.popupActions}>
          <Pressable
            accessibilityRole="button"
            onPress={onLeague}
            style={({ pressed }) => [
              styles.popupAction,
              styles.popupLeague,
              pressed && styles.popupActionPressed,
            ]}
          >
            <Text style={styles.popupActionText}>{t('league')}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onToggle}
            style={({ pressed }) => [
              styles.popupAction,
              active ? styles.popupDisable : styles.popupEnable,
              pressed && styles.popupActionPressed,
            ]}
          >
            <Text style={styles.popupActionText}>
              {active ? t('deactivate') : t('activate')}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  );
}

function AddGamePopup({ blurTarget, onClose, onSave }) {
  const { colors, isDark, t } = useAppTheme();
  const [coverUri, setCoverUri] = useState(null);
  const [logoUri, setLogoUri] = useState(null);
  const [name, setName] = useState('');
  const canSave = Boolean(name.trim() && coverUri && logoUri);

  const pickImage = async (type) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        t('permissionNeeded'),
        t('permissionPhotos'),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: type === 'cover' ? [16, 7] : [1, 1],
      mediaTypes: ['images'],
      quality: 0.9,
    });

    if (!result.canceled) {
      if (type === 'cover') {
        setCoverUri(result.assets[0].uri);
      } else {
        setLogoUri(result.assets[0].uri);
      }
    }
  };

  return (
    <Pressable accessibilityLabel={t('close')} onPress={onClose} style={styles.popupBackdrop}>
      <BlurView
        blurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        blurReductionFactor={3}
        blurTarget={blurTarget}
        intensity={55}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        tint={isDark ? 'dark' : 'light'}
      />
      <View pointerEvents="none" style={styles.popupShade} />

      <Pressable
        accessibilityRole="dialog"
        onPress={(event) => event.stopPropagation()}
        style={[styles.addGameCard, { backgroundColor: colors.card }]}
      >
        <Pressable
          accessibilityLabel={t('close')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [styles.popupClose, pressed && styles.popupClosePressed]}
        >
          <Text style={styles.popupCloseText}>×</Text>
        </Pressable>

        <Text style={[styles.addGameTitle, { color: isDark ? colors.text : '#3159AD' }]}>{t('newGame')}</Text>
        <Text style={[styles.addGameHint, { color: colors.muted }]}>{t('insertAllData')}</Text>

        <Pressable
          accessibilityLabel={t('cover')}
          accessibilityRole="button"
          onPress={() => pickImage('cover')}
          style={({ pressed }) => [
            styles.coverPicker,
            { backgroundColor: colors.cardAlt, borderColor: coverUri ? colors.accent : colors.border },
            pressed && styles.addPickerPressed,
          ]}
        >
          {coverUri ? (
            <Image resizeMode="cover" source={{ uri: coverUri }} style={styles.pickedCover} />
          ) : (
            <View style={styles.imagePickerEmpty}>
              <Text style={styles.imagePickerPlus}>+</Text>
              <Text style={[styles.imagePickerLabel, { color: colors.muted }]}>{t('cover')}</Text>
              <Text style={[styles.imagePickerRatio, { color: colors.muted }]}>{t('formatRatio')}</Text>
            </View>
          )}
          {coverUri && <View style={styles.editImageBadge}><Text style={styles.editImageBadgeText}>{t('edit')}</Text></View>}
        </Pressable>

        <View style={styles.logoAndNameRow}>
          <Pressable
            accessibilityLabel={t('logo')}
            accessibilityRole="button"
            onPress={() => pickImage('logo')}
            style={({ pressed }) => [
              styles.logoPicker,
              { backgroundColor: colors.cardAlt, borderColor: logoUri ? colors.accent : colors.border },
              pressed && styles.addPickerPressed,
            ]}
          >
            {logoUri ? (
              <Image resizeMode="contain" source={{ uri: logoUri }} style={styles.pickedLogo} />
            ) : (
              <>
                <Text style={styles.logoPickerPlus}>+</Text>
                <Text style={[styles.logoPickerLabel, { color: colors.muted }]}>{t('logo')}</Text>
              </>
            )}
          </Pressable>

          <View style={styles.gameNameField}>
            <Text style={[styles.gameNameLabel, { color: colors.muted }]}>{t('gameName')}</Text>
            <TextInput
              accessibilityLabel={t('gameName')}
              maxLength={40}
              onChangeText={setName}
              placeholder={t('insertName')}
              placeholderTextColor={isDark ? '#8290A4' : '#A9A9A9'}
              style={[
                styles.gameNameInput,
                { backgroundColor: colors.cardAlt, borderColor: colors.border, color: colors.text },
              ]}
              value={name}
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!canSave}
          onPress={() => onSave({ coverUri, logoUri, name: name.trim() })}
          style={({ pressed }) => [
            styles.addGameSave,
            !canSave && styles.addGameSaveDisabled,
            pressed && canSave && styles.popupActionPressed,
          ]}
        >
          <Text style={styles.addGameSaveText}>{t('add')}</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  );
}

function RankingCard({ compact, onAward, participant, pointsColor }) {
  const { colors, isDark, t } = useAppTheme();
  const rankColor = RANK_COLORS[participant.rank - 1] || '#3159AD';

  return (
    <View style={[
      styles.rankingCard,
      compact && styles.rankingCardCompact,
      isDark && { backgroundColor: colors.card },
    ]}>
      <View
        style={[
          styles.rankBand,
          compact && styles.rankBandCompact,
          { backgroundColor: rankColor },
        ]}
      >
        <Text style={styles.rankNumber}>{participant.rank}°</Text>
      </View>

      <View
        style={[styles.rankingInfo, compact && styles.rankingInfoCompact]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.rankingName,
            compact && styles.rankingNameCompact,
            { color: rankColor },
          ]}
        >
          {participant.username}
        </Text>
        <Text style={[styles.rankingPresence, isDark && { color: colors.muted }]}>
          {t('presences')}: {participant.attendances}
        </Text>

        <View
          style={[styles.scoreActions, compact && styles.scoreActionsCompact]}
        >
          {[4, 3, 2, 1].map((score) => (
            <Pressable
              accessibilityLabel={`${t('assignPoints')} ${participant.username}: ${score}`}
              accessibilityRole="button"
              key={score}
              onPress={() => onAward(participant.id, score)}
              style={({ pressed }) => [
                styles.scoreButton,
                compact && styles.scoreButtonCompact,
                score === 4 && styles.scoreFour,
                score === 3 && styles.scoreThree,
                score === 2 && styles.scoreTwo,
                score === 1 && styles.scoreOne,
                pressed && styles.scoreButtonPressed,
              ]}
            >
              <Text style={styles.scoreButtonText}>+{score}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.rankingPoints,
          compact && styles.rankingPointsCompact,
          { backgroundColor: pointsColor },
        ]}
      >
        <Text
          style={[
            styles.rankingPointsValue,
            compact && styles.rankingPointsValueCompact,
          ]}
        >
          {participant.points}
        </Text>
        <Text style={styles.rankingPointsLabel}>{t('points')}</Text>
      </View>
    </View>
  );
}

function LeagueScreen({ game, leagueStats, onAward, onSave }) {
  const { colors, isDark, t } = useAppTheme();
  const { height: viewportHeight } = useWindowDimensions();
  const compact = viewportHeight < 900;
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [season, setSeason] = useState('summer');
  const [year, setYear] = useState(2026);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const statsKey = `${game.key}-${year}-${season}`;
  const currentStats = leagueStats[statsKey] || {};
  const selectedSeason = SEASONS.find(
    (availableSeason) => availableSeason.key === season,
  );

  const rankedParticipants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const ranked = LEAGUE_PARTICIPANTS.map((participant, originalIndex) => ({
      ...participant,
      attendances: currentStats[participant.id]?.attendances || 0,
      originalIndex,
      points: currentStats[participant.id]?.points || 0,
    }))
      .sort(
        (first, second) =>
          second.points - first.points ||
          second.attendances - first.attendances ||
          first.originalIndex - second.originalIndex,
      )
      .map((participant, index) => ({ ...participant, rank: index + 1 }));

    if (!normalizedSearch) {
      return ranked;
    }

    return ranked.filter(
      (participant) =>
        participant.username.toLowerCase().includes(normalizedSearch) ||
        participant.memberId.includes(normalizedSearch),
    );
  }, [currentStats, search]);

  const visibleParticipants = expanded
    ? rankedParticipants
    : rankedParticipants.slice(0, 7);

  return (
    <View style={[styles.leagueScreen, compact && styles.leagueScreenCompact]}>
      <View
        style={[
          styles.leagueLogoFrame,
          game.leagueLogo && styles.yugiohLeagueLogoFrame,
        ]}
      >
        <Image
          accessibilityLabel={`${t('league')} ${game.name}`}
          resizeMode="contain"
          source={game.leagueLogo || game.icon}
          style={
            game.leagueLogo
              ? [styles.leagueLogo, styles.yugiohLeagueLogo]
              : [
                  styles.leagueLogo,
                  {
                    height: game.logoHeight * 1.2,
                    width: game.logoWidth * 1.2,
                  },
                ]
          }
        />
      </View>

      <View style={styles.leagueFilters}>
        <View style={styles.leagueSearchBox}>
          <TextInput
            accessibilityLabel={t('searchUsername')}
            onChangeText={setSearch}
            placeholder={t('searchUsername')}
            placeholderTextColor="#fff"
            style={styles.leagueSearchInput}
            value={search}
          />
        </View>

        <View style={styles.yearSelectorWrap}>
          <Pressable
            accessibilityLabel={t('selectYear')}
            accessibilityRole="button"
            onPress={() => setYearMenuOpen((open) => !open)}
            style={({ pressed }) => [
              styles.yearSelector,
              pressed && styles.yearSelectorPressed,
            ]}
          >
            <Text style={styles.yearSelectorText}>{year}</Text>
            <Text style={styles.yearSelectorArrow}>▾</Text>
          </Pressable>

          {yearMenuOpen && (
            <View style={[styles.yearDropdown, isDark && { backgroundColor: colors.card }]}>
              {LEAGUE_YEARS.map((availableYear) => (
                <Pressable
                  accessibilityRole="menuitem"
                  key={availableYear}
                  onPress={() => {
                    setYear(availableYear);
                    setYearMenuOpen(false);
                    setExpanded(false);
                  }}
                  style={({ pressed }) => [
                    styles.yearOption,
                    availableYear === year && styles.yearOptionSelected,
                    pressed && styles.yearOptionPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.yearOptionText,
                      availableYear === year && styles.yearOptionTextSelected,
                      isDark && { color: colors.text },
                    ]}
                  >
                    {availableYear}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.seasonFilters}>
        {SEASONS.map((availableSeason) => {
          const selected = season === availableSeason.key;
          const SeasonIcon = availableSeason.Icon;

          return (
            <Pressable
              accessibilityLabel={`${t('filterSeason')} ${availableSeason.key}`}
              accessibilityRole="button"
              key={availableSeason.key}
              onPress={() => {
                setSeason(availableSeason.key);
                setExpanded(false);
              }}
              style={({ pressed }) => [
                styles.seasonButton,
                { backgroundColor: availableSeason.color },
                selected && styles.seasonButtonSelected,
                pressed && styles.seasonButtonPressed,
              ]}
            >
              <SeasonIcon width={26} height={26} />
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.rankingList,
          compact && styles.rankingListCompact,
        ]}
        showsVerticalScrollIndicator={false}
        style={styles.rankingScroll}
      >
        {visibleParticipants.map((participant) => (
          <RankingCard
            compact={compact}
            key={participant.id}
            onAward={(participantId, score) =>
              onAward(statsKey, participantId, score)
            }
            participant={participant}
            pointsColor={selectedSeason?.color || '#F5C330'}
          />
        ))}

        {rankedParticipants.length === 0 && (
          <Text style={[styles.leagueNoResults, isDark && { color: colors.text }]}>{t('noParticipants')}</Text>
        )}

      </ScrollView>

      <View style={styles.leagueFooter}>
        {rankedParticipants.length > 7 && (
          <Pressable
            accessibilityRole="button"
            hitSlop={7}
            onPress={() => setExpanded((currentValue) => !currentValue)}
          >
            <Text style={styles.showMoreParticipants}>
              {expanded
                ? t('hideParticipants')
                : t('moreParticipants')}
            </Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={onSave}
          style={({ pressed }) => [
            styles.leagueSave,
            pressed && styles.leagueSavePressed,
          ]}
        >
          <Text style={styles.leagueSaveText}>{t('save')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function Games({ activeGames, navigation, onActiveGamesChange }) {
  const { colors, isDark, t } = useAppTheme();
  const blurTargetRef = useRef(null);
  const [addGameOpen, setAddGameOpen] = useState(false);
  const [games, setGames] = useState(GAMES);
  const [leagueGame, setLeagueGame] = useState(null);
  const [leagueStats, setLeagueStats] = useState({});
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);

  const visibleGames = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return games;
    }

    return games.filter((game) =>
      game.name.toLowerCase().includes(normalizedSearch),
    );
  }, [games, search]);

  const handleBack = () => {
    if (addGameOpen) {
      setAddGameOpen(false);
      return;
    }

    if (selectedGame) {
      setSelectedGame(null);
      return;
    }

    if (leagueGame) {
      setLeagueGame(null);
      return;
    }

    navigation.navigate('Home');
  };

  const toggleSelectedGame = () => {
    if (!selectedGame) {
      return;
    }

    onActiveGamesChange((currentGames) => {
      const nextGames = new Set(currentGames);

      if (nextGames.has(selectedGame.key)) {
        nextGames.delete(selectedGame.key);
      } else {
        nextGames.add(selectedGame.key);
      }

      return nextGames;
    });
  };

  const selectedGameActive = selectedGame
    ? activeGames.has(selectedGame.key)
    : false;

  const awardLeaguePoints = (statsKey, participantId, score) => {
    setLeagueStats((currentLeagueStats) => {
      const currentBoard = currentLeagueStats[statsKey] || {};
      const currentParticipant = currentBoard[participantId] || {
        attendances: 0,
        points: 0,
      };

      return {
        ...currentLeagueStats,
        [statsKey]: {
          ...currentBoard,
          [participantId]: {
            attendances: currentParticipant.attendances + 1,
            points: currentParticipant.points + score,
          },
        },
      };
    });
  };

  const addGame = ({ coverUri, logoUri, name }) => {
    const key = `custom-${Date.now()}`;
    const newGame = {
      cover: { uri: coverUri },
      custom: true,
      icon: { uri: logoUri },
      key,
      logoHeight: 52,
      logoWidth: 82,
      gridScale: 1,
      name,
    };

    setGames((currentGames) => [...currentGames, newGame]);
    onActiveGamesChange((currentGames) => {
      const nextGames = new Set(currentGames);
      nextGames.add(key);
      return nextGames;
    });
    setSearch('');
    setAddGameOpen(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <BlurTargetView ref={blurTargetRef} style={[styles.screen, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
          <View style={styles.contentWidth}>
            <AppHeader onBack={handleBack} />

            {leagueGame ? (
              <LeagueScreen
                game={leagueGame}
                leagueStats={leagueStats}
                onAward={awardLeaguePoints}
                onSave={() => setLeagueGame(null)}
              />
            ) : (
              <>
                <SearchBar onChangeText={setSearch} value={search} />

                <ScrollView
                  contentContainerStyle={styles.gamesScrollContent}
                  showsVerticalScrollIndicator={false}
                  style={styles.gamesScroll}
                >
                  <View style={styles.gamesGrid}>
                    {visibleGames.map((game) => (
                      <GameChip
                        active={activeGames.has(game.key)}
                        game={game}
                        key={game.key}
                        onPress={() => setSelectedGame(game)}
                        selected={selectedGame?.key === game.key}
                      />
                    ))}
                  </View>

                  {visibleGames.length === 0 && (
                    <Text style={[styles.noResults, isDark && { color: colors.text }]}>{t('noGames')}</Text>
                  )}
                </ScrollView>

                <View style={[styles.gamesFooter, { backgroundColor: colors.background }]}>
                  <Text style={[styles.gamesTotal, isDark && { color: colors.text }]}>
                    {t('total')}: {activeGames.size}
                  </Text>
                  <Pressable
                    accessibilityLabel={t('addGame')}
                    accessibilityRole="button"
                    onPress={() => setAddGameOpen(true)}
                    style={({ pressed }) => [styles.addGameButton, pressed && styles.addGameButtonPressed]}
                  >
                    <Text style={styles.addGameButtonText}>+</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>

          <StatusBar style={isDark ? 'light' : 'dark'} />
        </SafeAreaView>
      </BlurTargetView>

      {selectedGame && (
        <GamesPopup
          active={selectedGameActive}
          blurTarget={blurTargetRef}
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onLeague={() => {
            setLeagueGame(selectedGame);
            setSelectedGame(null);
          }}
          onToggle={toggleSelectedGame}
        />
      )}

      {addGameOpen && (
        <AddGamePopup
          blurTarget={blurTargetRef}
          onClose={() => setAddGameOpen(false)}
          onSave={addGame}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#DEDEDE',
  },
  contentWidth: {
    width: '100%',
    maxWidth: 480,
    flex: 1,
    alignSelf: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
  searchRow: {
    width: '80%',
    maxWidth: 370,
    height: 35,
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 19,
    marginBottom: 29,
    borderRadius: 18,
    backgroundColor: '#95A7CB',
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 14,
    color: '#fff',
    fontSize: 13,
    outlineWidth: 0,
  },
  searchButton: {
    minWidth: 65,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#3159AD',
  },
  searchButtonPressed: {
    opacity: 0.72,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 13,
  },
  gamesScroll: {
    flex: 1,
  },
  gamesScrollContent: {
    minHeight: '100%',
    paddingBottom: 17,
  },
  gamesGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    paddingHorizontal: 22,
  },
  gameChip: {
    width: '46%',
    maxWidth: 195,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  gameChipInactive: {
    backgroundColor: '#AAAAAA',
  },
  gameChipSelected: {
    backgroundColor: '#ADF8FF',
  },
  gameChipPressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
  gameChipLogoFrame: {
    width: '95%',
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gameChipLogo: {
    flexShrink: 0,
    maxWidth: '94%',
    maxHeight: '90%',
  },
  customGameCover: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  customGameCoverShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 29, 62, 0.56)',
  },
  customGameIdentity: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 8,
  },
  customGameLogoWrap: {
    width: 48,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  customGameLogo: {
    width: 42,
    height: 35,
  },
  customGameName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  noResults: {
    marginTop: 35,
    color: '#3159AD',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  gamesFooter: {
    position: 'relative',
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#DEDEDE',
  },
  gamesTotal: {
    color: '#3159AD',
    fontSize: 22,
    fontWeight: '900',
  },
  addGameButton: {
    position: 'absolute',
    right: 24,
    top: 7,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#5378C5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  addGameButtonPressed: {
    opacity: 0.74,
    transform: [{ scale: 0.94 }],
  },
  addGameButtonText: {
    marginTop: -3,
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '300',
    lineHeight: 38,
  },
  leagueScreen: {
    flex: 1,
    marginTop: -25,
    paddingHorizontal: 14,
  },
  leagueScreenCompact: {
    marginTop: -85,
  },
  leagueLogoFrame: {
    width: '100%',
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  leagueLogo: {
    flexShrink: 0,
  },
  yugiohLeagueLogoFrame: {
    height: 138,
    justifyContent: 'flex-start',
  },
  yugiohLeagueLogo: {
    width: 210,
    height: 118,
    marginBottom: 20,
  },
  leagueFilters: {
    zIndex: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  leagueSearchBox: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#B8B8B8',
  },
  leagueSearchInput: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    outlineWidth: 0,
  },
  yearSelectorWrap: {
    zIndex: 30,
    width: 86,
    position: 'relative',
  },
  yearSelector: {
    position: 'relative',
    width: '100%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#7899DB',
  },
  yearSelectorPressed: {
    opacity: 0.75,
  },
  yearSelectorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  yearSelectorArrow: {
    position: 'absolute',
    top: 0,
    right: 11,
    height: 36,
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 36,
    textAlign: 'center',
  },
  yearDropdown: {
    position: 'absolute',
    top: 41,
    right: 0,
    width: '100%',
    paddingVertical: 5,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 9,
  },
  yearOption: {
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearOptionSelected: {
    backgroundColor: '#E5EBF8',
  },
  yearOptionPressed: {
    backgroundColor: '#D7E0F2',
  },
  yearOptionText: {
    color: '#3159AD',
    fontSize: 12,
    fontWeight: '700',
  },
  yearOptionTextSelected: {
    fontWeight: '900',
  },
  seasonFilters: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  seasonButton: {
    width: '23%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  seasonButtonSelected: {
    borderWidth: 4,
    borderColor: '#fff',
  },
  seasonButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  rankingScroll: {
    zIndex: 1,
    flex: 1,
    marginTop: 10,
  },
  rankingList: {
    gap: 7,
    paddingBottom: 8,
  },
  rankingListCompact: {
    gap: 3,
  },
  rankingCard: {
    width: '100%',
    minHeight: 70,
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  rankingCardCompact: {
    minHeight: 48,
    height: 48,
    borderRadius: 12,
  },
  rankBand: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 9,
  },
  rankBandCompact: {
    width: 32,
    paddingTop: 5,
  },
  rankNumber: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  rankingInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  rankingInfoCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rankingName: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  rankingNameCompact: {
    fontSize: 15,
    lineHeight: 16,
  },
  rankingPresence: {
    color: '#9A9A9A',
    fontSize: 9,
    fontWeight: '700',
  },
  scoreActions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  scoreActionsCompact: {
    gap: 5,
    marginTop: 1,
  },
  scoreButton: {
    flex: 1,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#E1E1E1',
  },
  scoreButtonCompact: {
    height: 15,
    borderRadius: 8,
  },
  scoreFour: {
    backgroundColor: '#F0E2A7',
  },
  scoreThree: {
    backgroundColor: '#D5D5D5',
  },
  scoreTwo: {
    backgroundColor: '#E5D59E',
  },
  scoreOne: {
    backgroundColor: '#DCE3DE',
  },
  scoreButtonPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.92 }],
  },
  scoreButtonText: {
    color: '#62675F',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 11,
  },
  rankingPoints: {
    width: 73,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 37,
    borderBottomLeftRadius: 37,
  },
  rankingPointsCompact: {
    width: 64,
    borderTopLeftRadius: 32,
    borderBottomLeftRadius: 32,
  },
  rankingPointsValue: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 27,
  },
  rankingPointsValueCompact: {
    fontSize: 24,
    lineHeight: 25,
  },
  rankingPointsLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  leagueNoResults: {
    marginTop: 30,
    color: '#3159AD',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  showMoreParticipants: {
    paddingVertical: 5,
    color: '#3159AD',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  leagueFooter: {
    minHeight: 65,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  leagueSave: {
    width: 112,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#3159AD',
  },
  leagueSavePressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  leagueSaveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  popupBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  popupShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 40, 55, 0.18)',
  },
  popupCard: {
    width: '84%',
    maxWidth: 330,
    minHeight: 326,
    alignItems: 'center',
    paddingTop: 42,
    paddingBottom: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 7,
    elevation: 9,
  },
  addGameCard: {
    width: '90%',
    maxWidth: 390,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 24,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.34,
    shadowRadius: 8,
    elevation: 10,
  },
  addGameTitle: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  addGameHint: {
    marginTop: 3,
    marginBottom: 18,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  coverPicker: {
    width: '100%',
    aspectRatio: 16 / 7,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 17,
  },
  pickedCover: {
    width: '100%',
    height: '100%',
  },
  imagePickerEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerPlus: {
    color: '#5378C5',
    fontSize: 31,
    fontWeight: '500',
    lineHeight: 31,
  },
  imagePickerLabel: {
    fontSize: 11,
    fontWeight: '900',
  },
  imagePickerRatio: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '600',
  },
  editImageBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(49, 89, 173, 0.92)',
  },
  editImageBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  logoAndNameRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 13,
    marginTop: 16,
  },
  logoPicker: {
    width: 86,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  pickedLogo: {
    width: 72,
    height: 62,
  },
  logoPickerPlus: {
    color: '#5378C5',
    fontSize: 27,
    fontWeight: '500',
    lineHeight: 28,
  },
  logoPickerLabel: {
    fontSize: 9,
    fontWeight: '900',
  },
  gameNameField: {
    flex: 1,
  },
  gameNameLabel: {
    marginBottom: 6,
    marginLeft: 10,
    fontSize: 10,
    fontWeight: '900',
  },
  gameNameInput: {
    width: '100%',
    height: 43,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderRadius: 22,
    fontSize: 13,
    fontWeight: '700',
    outlineStyle: 'none',
  },
  addPickerPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  addGameSave: {
    width: 140,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 23,
    borderRadius: 20,
    backgroundColor: '#3159AD',
  },
  addGameSaveDisabled: {
    opacity: 0.42,
  },
  addGameSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  popupClose: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#C96F70',
  },
  popupClosePressed: {
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
  },
  popupCloseText: {
    marginTop: -2,
    color: '#fff',
    fontSize: 29,
    fontWeight: '300',
    lineHeight: 32,
  },
  popupLogoFrame: {
    width: '82%',
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  popupLogo: {
    flexShrink: 0,
  },
  popupActions: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
  },
  popupAction: {
    width: 136,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.23,
    shadowRadius: 3,
    elevation: 4,
  },
  popupLeague: {
    backgroundColor: '#C96F70',
  },
  popupDisable: {
    backgroundColor: '#8D3434',
  },
  popupEnable: {
    backgroundColor: '#348340',
  },
  popupActionPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.97 }],
  },
  popupActionText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
  },
});
