import { StatusBar } from 'expo-status-bar';
import { BlurTargetView, BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import AppHeader from './AppHeader';
import { useAppTheme } from './ThemeContext';

const GAMES = [
  {
    key: 'yugioh',
    name: 'Yu-Gi-Oh!',
    coverScale: 1.3,
    iconScale: 1.05,
    cover: require('./assets/copertine_giochi/yugioh.png'),
    icon: require('./assets/icone_giochi/yugioh.png'),
  },
  {
    key: 'pokemon',
    name: 'Pokémon',
    coverScale: 1.45,
    iconScale: 0.95,
    cover: require('./assets/copertine_giochi/pokemon.png'),
    icon: require('./assets/icone_giochi/pokemon.png'),
  },
  {
    key: 'onepiece',
    name: 'One Piece',
    coverScale: 2.3,
    iconScale: 1.25,
    cover: require('./assets/copertine_giochi/onepiece.png'),
    icon: require('./assets/icone_giochi/onepiece.png'),
  },
  {
    key: 'beyblade',
    name: 'Beyblade',
    coverScale: 0.8,
    iconScale: 1.1,
    cover: require('./assets/copertine_giochi/beyblade.png'),
    icon: require('./assets/icone_giochi/beyblade.png'),
  },
  {
    key: 'magic',
    name: 'Magic',
    coverScale: 0.9,
    iconScale: 0.95,
    cover: require('./assets/copertine_giochi/magic.png'),
    icon: require('./assets/icone_giochi/magic.png'),
  },
  {
    key: 'lorcana',
    name: 'Lorcana',
    coverScale: 1.2,
    iconScale: 1.35,
    cover: require('./assets/copertine_giochi/lorcana.png'),
    icon: require('./assets/icone_giochi/lorcana.png'),
  },
  {
    key: 'naruto',
    name: 'Naruto',
    coverScale: 1.8,
    iconScale: 1.55,
    cover: require('./assets/copertine_giochi/naruto.png'),
    icon: require('./assets/icone_giochi/naruto.png'),
  },
  {
    key: 'dnd',
    name: 'Dungeons & Dragons',
    coverScale: 2.6,
    iconScale: 1.35,
    cover: require('./assets/copertine_giochi/dnd.png'),
    icon: require('./assets/icone_giochi/dnd.png'),
  },
  {
    key: 'riftbound',
    name: 'Riftbound',
    coverScale: 1.7,
    iconScale: 1.35,
    cover: require('./assets/copertine_giochi/riftbound.png'),
    icon: require('./assets/icone_giochi/riftbound.png'),
  },
  {
    key: 'pokemon_champions',
    name: 'Pokémon Champions',
    coverScale: 1,
    iconScale: 0.95,
    cover: require('./assets/copertine_giochi/pokemon_champions.png'),
    icon: require('./assets/icone_giochi/pokemonchampions.png'),
  },
  {
    key: 'yugioh_edison',
    name: 'Yu-Gi-Oh! Edison',
    coverScale: 0.9,
    iconScale: 1,
    cover: require('./assets/copertine_giochi/yugioh_edison.png'),
    icon: require('./assets/icone_giochi/yugioh_edison.png'),
  },
];

const EMPTY_FORM = {
  fullName: '',
  nickname: '',
  birthDate: '',
  phone: '',
  email: '',
  password: '',
};

function ProfileOutlineIcon({ size = 42 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Circle cx={25} cy={25} r={21} fill="none" stroke="#fff" strokeWidth={4} />
      <Circle cx={25} cy={18} r={7} fill="#fff" />
      <Path
        d="M11 39C13 31 17.7 27 25 27C32.3 27 37 31 39 39C35.2 43.6 30.5 46 25 46C19.5 46 14.8 43.6 11 39Z"
        fill="#fff"
      />
    </Svg>
  );
}

function HamburgerIcon() {
  return (
    <Svg width={24} height={18} viewBox="0 0 24 18">
      <Path
        d="M2 3H22M2 9H22M2 15H22"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth={2.4}
      />
    </Svg>
  );
}

function HistoryIcon() {
  return (
    <Svg width={27} height={27} viewBox="0 0 24 24">
      <Path
        d="M4.5 8.2A8 8 0 1 1 4 14"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth={2.2}
      />
      <Path
        d="M4.5 4.5V8.5H8.5"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
      />
      <Path
        d="M12 7.5V12L15 14"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
      />
    </Svg>
  );
}

function PopupActionIcon({ type }) {
  if (type === 'credit') {
    return (
      <Svg width={25} height={25} viewBox="0 0 24 24">
        <Path
          d="M3 5H21C22.1 5 23 5.9 23 7V17C23 18.1 22.1 19 21 19H3C1.9 19 1 18.1 1 17V7C1 5.9 1.9 5 3 5ZM3 8V10H21V8H3ZM4 14V17H11V14H4Z"
          fill="#fff"
        />
      </Svg>
    );
  }

  if (type === 'games') {
    return (
      <Svg width={27} height={27} viewBox="0 0 24 24">
        <Path
          d="M7.5 6H16.5C19.54 6 22 8.46 22 11.5V15.25C22 17.32 20.32 19 18.25 19C17.09 19 16 18.46 15.29 17.54L14.1 16H9.9L8.71 17.54C8 18.46 6.91 19 5.75 19C3.68 19 2 17.32 2 15.25V11.5C2 8.46 4.46 6 7.5 6ZM7 9V11H5V13H7V15H9V13H11V11H9V9H7ZM16.5 10C15.67 10 15 10.67 15 11.5C15 12.33 15.67 13 16.5 13C17.33 13 18 12.33 18 11.5C18 10.67 17.33 10 16.5 10ZM19 13C18.45 13 18 13.45 18 14C18 14.55 18.45 15 19 15C19.55 15 20 14.55 20 14C20 13.45 19.55 13 19 13Z"
          fill="#fff"
        />
      </Svg>
    );
  }

  return (
    <Svg width={27} height={27} viewBox="0 0 24 24">
      <Path
        d="M19.14 12.94C19.18 12.63 19.2 12.32 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.83 12.63 4.88 12.94L2.85 14.52C2.67 14.66 2.62 14.93 2.73 15.13L4.65 18.45C4.77 18.67 5.02 18.74 5.24 18.67L7.63 17.71C8.13 18.09 8.66 18.41 9.25 18.65L9.61 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.4 21.19L14.76 18.65C15.35 18.41 15.89 18.08 16.38 17.71L18.77 18.67C18.99 18.75 19.24 18.67 19.36 18.45L21.28 15.13C21.4 14.91 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.01 15.6 8.4 13.99 8.4 12C8.4 10.01 10.01 8.4 12 8.4C13.99 8.4 15.6 10.01 15.6 12C15.6 13.99 13.99 15.6 12 15.6Z"
        fill="#fff"
      />
    </Svg>
  );
}

function UserPopup({ blurTarget, onClose, onCredit, user }) {
  const { colors, isDark, t } = useAppTheme();
  const actions = [
    {
      key: 'credit',
      label: t('credit'),
      onPress: onCredit,
      style: styles.popupActionCredit,
    },
    { key: 'games', label: t('addId'), style: styles.popupActionGames },
    { key: 'edit', label: t('editProfile'), style: styles.popupActionEdit },
  ];

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
        tint={isDark ? 'dark' : 'light'}
      />
      <View pointerEvents="none" style={styles.popupShade} />

      <Pressable
        accessibilityRole="dialog"
        onPress={(event) => event.stopPropagation()}
        style={[styles.popupCard, isDark && { backgroundColor: colors.card }]}
      >
        <Text numberOfLines={1} style={[styles.popupTitle, isDark && { color: colors.text }]}>
          {user.fullName.toUpperCase()}
        </Text>

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

        <View style={styles.popupActions}>
          {actions.map((action) => (
            <Pressable
              accessibilityRole="button"
              key={action.key}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.popupAction,
                action.style,
                pressed && styles.popupActionPressed,
              ]}
            >
              <PopupActionIcon type={action.key} />
              <Text
                numberOfLines={1}
                style={styles.popupActionText}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Pressable>
  );
}

function CreditCounterCard({ brand, onChange, onHistory, userName, value }) {
  const { colors, isDark, t } = useAppTheme();
  const isSideQuest = brand === 'sidequest';
  const numericValue = Number(value) || 0;
  const [adjustment, setAdjustment] = useState('');
  const [description, setDescription] = useState('');
  const adjustmentValue = Number(adjustment) || 0;

  const applyAdjustment = (direction) => {
    if (adjustmentValue <= 0) {
      return;
    }

    const nextValue =
      direction === 'subtract'
        ? Math.max(0, numericValue - adjustmentValue)
        : numericValue + adjustmentValue;

    onChange(nextValue);
  };

  return (
    <View style={styles.creditEditorCardShadow}>
      <LinearGradient
        colors={
          isSideQuest
            ? ['#061523', '#174C79', '#3F98ED']
            : ['#950D10', '#FCA129']
        }
        end={isSideQuest ? { x: 1, y: 0.65 } : { x: 1, y: 0.5 }}
        start={isSideQuest ? { x: 0, y: 0.35 } : { x: 0, y: 0.5 }}
        style={styles.creditEditorCard}
      >
        <View style={styles.creditEditorCardTop}>
          <Image
            accessibilityLabel={isSideQuest ? 'SideQuest Card' : 'GameMania Card'}
            resizeMode="contain"
            source={
              isSideQuest
                ? require('./assets/sidequestcard.png')
                : require('./assets/gamemaniacard.png')
            }
            style={[
              styles.creditEditorLogo,
              !isSideQuest && styles.creditEditorGameManiaLogo,
            ]}
          />

          <TextInput
            accessibilityLabel={`${t('transactionDescription')} ${isSideQuest ? 'SideQuest' : 'GameMania'}`}
            maxLength={60}
            onChangeText={setDescription}
            placeholder={t('transactionDescription')}
            placeholderTextColor="rgba(255, 255, 255, 0.72)"
            returnKeyType="done"
            style={styles.creditTransactionDescription}
            value={description}
          />

          <View style={styles.creditEditorControls}>
            <View style={styles.creditAdjustmentArea}>
              <Pressable
                accessibilityLabel={`${t('subtractCredits')} ${adjustmentValue} ${isSideQuest ? 'SideQuest' : 'GameMania'}`}
                accessibilityRole="button"
                disabled={adjustmentValue === 0}
                hitSlop={6}
                onPress={() => applyAdjustment('subtract')}
                style={({ pressed }) => [
                  styles.creditEditorControl,
                  isDark && { backgroundColor: colors.card },
                  adjustmentValue === 0 && styles.creditEditorControlDisabled,
                  pressed && styles.creditEditorControlPressed,
                ]}
              >
                <Text style={[styles.creditEditorControlText, isDark && { color: colors.text }]}>−</Text>
              </Pressable>

              <TextInput
                accessibilityLabel={`${t('amountToEdit')} ${isSideQuest ? 'SideQuest' : 'GameMania'}`}
                inputMode="numeric"
                keyboardType="number-pad"
                maxLength={4}
                onChangeText={(text) =>
                  setAdjustment(text.replace(/\D/g, ''))
                }
                placeholder="0"
                placeholderTextColor="#8D95A3"
                selectTextOnFocus
                style={[styles.creditAdjustmentInput, isDark && { backgroundColor: colors.card, color: colors.text }]}
                value={adjustment}
              />

              <Pressable
                accessibilityLabel={`${t('addCredits')} ${adjustmentValue} ${isSideQuest ? 'SideQuest' : 'GameMania'}`}
                accessibilityRole="button"
                disabled={adjustmentValue === 0}
                hitSlop={6}
                onPress={() => applyAdjustment('add')}
                style={({ pressed }) => [
                  styles.creditEditorControl,
                  isDark && { backgroundColor: colors.card },
                  adjustmentValue === 0 && styles.creditEditorControlDisabled,
                  pressed && styles.creditEditorControlPressed,
                ]}
              >
                <Text style={[styles.creditEditorControlText, isDark && { color: colors.text }]}>+</Text>
              </Pressable>
            </View>

            <View style={styles.creditTotalArea}>
              <Text style={styles.creditTotalLabel}>{t('total')}</Text>
              <Text style={styles.creditEditorValue}>{numericValue}</Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.creditEditorFooter,
            isSideQuest
              ? styles.creditEditorFooterSideQuest
              : styles.creditEditorFooterGameMania,
          ]}
        >
          <Text numberOfLines={1} style={styles.creditEditorUserName}>
            {userName}
          </Text>
          <Pressable
            accessibilityLabel={`${t('openHistory')} ${isSideQuest ? 'SideQuest' : 'GameMania'}`}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => onHistory(brand)}
            style={({ pressed }) => [
              styles.creditEditorHistoryButton,
              pressed && styles.creditEditorHistoryButtonPressed,
            ]}
          >
            <HistoryIcon />
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

function CreditScreen({ credits, onChange, onHistory, onSave, userName }) {
  const { colors, isDark, t } = useAppTheme();
  return (
    <ScrollView
      contentContainerStyle={styles.creditEditorScreen}
      showsVerticalScrollIndicator={false}
      style={styles.creditEditorScroll}
    >
      <Text style={[styles.creditEditorTitle, isDark && { color: colors.text }]}>{t('updateCredit')}</Text>

      <View style={styles.creditEditorCards}>
        <CreditCounterCard
          brand="sidequest"
          onChange={(value) => onChange('sideQuest', value)}
          onHistory={onHistory}
          userName={userName}
          value={credits.sideQuest}
        />
        <CreditCounterCard
          brand="gamemania"
          onChange={(value) => onChange('gameMania', value)}
          onHistory={onHistory}
          userName={userName}
          value={credits.gameMania}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onSave}
        style={({ pressed }) => [
          styles.creditEditorSave,
          pressed && styles.creditEditorSavePressed,
        ]}
      >
        <Text style={styles.creditEditorSaveText}>{t('save')}</Text>
      </Pressable>
    </ScrollView>
  );
}

function CreditHistoryScreen({ brand, userName, value }) {
  const { colors, isDark, language, t } = useAppTheme();
  const isSideQuest = brand === 'sidequest';
  const brandName = isSideQuest ? 'SideQuest' : 'GameMania';
  const movements = isSideQuest
    ? [
        { amount: 10, date: `${t('today')} · 10:30`, label: t('creditTopUp') },
        { amount: -5, date: language === 'en' ? '02 AUG 2026' : '02 AGO 2026', label: t('tournamentEntry') },
        { amount: 15, date: language === 'en' ? '28 JUL 2026' : '28 LUG 2026', label: t('monthlyBonus') },
        { amount: -10, date: language === 'en' ? '20 JUL 2026' : '20 LUG 2026', label: t('eventPurchase') },
      ]
    : [
        { amount: 10, date: `${t('today')} · 10:30`, label: t('creditTopUp') },
        { amount: -10, date: language === 'en' ? '01 AUG 2026' : '01 AGO 2026', label: t('weeklyTournament') },
        { amount: 20, date: language === 'en' ? '25 JUL 2026' : '25 LUG 2026', label: t('promotionalCredit') },
        { amount: -5, date: language === 'en' ? '18 JUL 2026' : '18 LUG 2026', label: t('tableBooking') },
      ];

  return (
    <ScrollView
      contentContainerStyle={styles.creditHistoryScreen}
      showsVerticalScrollIndicator={false}
      style={styles.creditEditorScroll}
    >
      <Text style={[styles.creditEditorTitle, isDark && { color: colors.text }]}>{t('creditHistory')}</Text>

      <LinearGradient
        colors={
          isSideQuest
            ? ['#061523', '#174C79', '#3F98ED']
            : ['#090E0E', '#713A21', '#F17A2D']
        }
        end={{ x: 1, y: 0.65 }}
        start={{ x: 0, y: 0.35 }}
        style={styles.creditHistorySummary}
      >
        <Image
          accessibilityLabel={`${brandName} Card`}
          resizeMode="contain"
          source={
            isSideQuest
              ? require('./assets/sidequestcard.png')
              : require('./assets/gamemaniacard.png')
          }
          style={[
            styles.creditHistoryLogo,
            !isSideQuest && styles.creditHistoryGameManiaLogo,
          ]}
        />
        <View style={styles.creditHistoryBalanceRow}>
          <View style={styles.creditHistoryUserBlock}>
            <Text numberOfLines={1} style={styles.creditHistoryUserName}>
              {userName}
            </Text>
            <Text style={styles.creditHistoryBalanceLabel}>{t('currentBalance')}</Text>
          </View>
          <Text style={styles.creditHistoryBalance}>{value}</Text>
        </View>
      </LinearGradient>

      <View style={[styles.creditHistoryPanel, isDark && { backgroundColor: colors.card }]}>
        <Text style={[styles.creditHistoryPanelTitle, isDark && { color: colors.text }]}>{t('latestMovements')}</Text>

        {movements.map((movement, index) => {
          const positive = movement.amount > 0;

          return (
            <View
              key={`${movement.date}-${movement.label}`}
              style={[
                styles.creditHistoryMovement,
                index === movements.length - 1 &&
                  styles.creditHistoryMovementLast,
              ]}
            >
              <View style={styles.creditHistoryMovementInfo}>
                <Text style={[styles.creditHistoryMovementLabel, isDark && { color: colors.text }]}>
                  {movement.label}
                </Text>
                <Text style={styles.creditHistoryMovementDate}>
                  {movement.date}
                </Text>
              </View>
              <View
                style={[
                  styles.creditHistoryAmountPill,
                  positive
                    ? styles.creditHistoryAmountPositive
                    : styles.creditHistoryAmountNegative,
                ]}
              >
                <Text style={styles.creditHistoryAmountText}>
                  {positive ? '+' : ''}
                  {movement.amount}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Stepper({ currentStep }) {
  const { colors, isDark, t } = useAppTheme();
  return (
    <View accessibilityLabel={`${t('step')} ${currentStep} / 3`} style={styles.stepper}>
      {[1, 2, 3].map((step, index) => (
        <View key={step} style={styles.stepperPart}>
          {index > 0 && <View style={styles.stepLine} />}
          <View
            style={[
              styles.stepCircle,
              isDark && { backgroundColor: colors.background },
              step === currentStep && styles.stepCircleActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                step === currentStep && styles.stepNumberActive,
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

function FormField({ onChangeText, placeholder, secureTextEntry, value }) {
  const { colors, isDark } = useAppTheme();
  return (
    <TextInput
      accessibilityLabel={placeholder}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#B9BAC0"
      secureTextEntry={secureTextEntry}
      style={[styles.formInput, isDark && { backgroundColor: colors.card, color: colors.text }]}
      value={value}
    />
  );
}

function UserDataStep({ form, onChange, onNext }) {
  const { t } = useAppTheme();
  return (
    <View style={styles.stepLayout}>
      <View style={styles.formPanel}>
        <ProfileOutlineIcon size={48} />

        <View style={styles.formFields}>
          <FormField
            onChangeText={(value) => onChange('fullName', value)}
            placeholder={t('nameSurname')}
            value={form.fullName}
          />
          <FormField
            onChangeText={(value) => onChange('nickname', value)}
            placeholder="nickname/id"
            value={form.nickname}
          />
          <FormField
            onChangeText={(value) => onChange('birthDate', value)}
            placeholder={t('birthDate')}
            value={form.birthDate}
          />
          <FormField
            onChangeText={(value) => onChange('phone', value)}
            placeholder={t('phoneOptional')}
            value={form.phone}
          />
          <FormField
            onChangeText={(value) => onChange('email', value)}
            placeholder={t('email')}
            value={form.email}
          />
          <FormField
            onChangeText={(value) => onChange('password', value)}
            placeholder={t('password')}
            secureTextEntry
            value={form.password}
          />
        </View>
      </View>

      <PrimaryButton label={t('next')} onPress={onNext} />
    </View>
  );
}

function GameSelectionStep({ onNext, onToggle, selectedGames }) {
  const { colors, isDark, t } = useAppTheme();
  return (
    <View style={styles.stepLayout}>
      <View style={styles.gameSelectionPanel}>
        <Text style={styles.panelTitle}>{t('gameChoice')}</Text>

        <ScrollView
          contentContainerStyle={styles.gameChoices}
          nestedScrollEnabled
          showsVerticalScrollIndicator
          style={styles.stepScroll}
        >
          {GAMES.map((game) => {
            const selected = selectedGames.includes(game.key);

            return (
              <Pressable
                accessibilityLabel={`${selected ? t('deselect') : t('select')} ${game.name}`}
                accessibilityRole="button"
                key={game.key}
                onPress={() => onToggle(game.key)}
                style={({ pressed }) => [
                  styles.gameChoice,
                  isDark && { backgroundColor: colors.card },
                  selected && styles.gameChoiceSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.gameCoverFrame}>
                  <Image
                    resizeMode="contain"
                    source={game.cover}
                    style={[
                      styles.gameCover,
                      game.key === 'riftbound' && styles.riftboundGameCover,
                      { transform: [{ scale: game.coverScale }] },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <PrimaryButton
        disabled={selectedGames.length === 0}
        label={t('next')}
        onPress={onNext}
      />
    </View>
  );
}

function GameIdsStep({ gameIds, onChangeId, onRegister, selectedGames }) {
  const { colors, isDark, t } = useAppTheme();
  const games = GAMES.filter((game) => selectedGames.includes(game.key));

  return (
    <View style={styles.stepLayout}>
      <View style={styles.idsPanel}>
        <Text style={styles.panelTitle}>{t('gameIds')}</Text>

        <ScrollView
          contentContainerStyle={styles.idCards}
          nestedScrollEnabled
          showsVerticalScrollIndicator
          style={styles.stepScroll}
        >
          {games.map((game) => (
          <View key={game.key} style={styles.idCard}>
              <View style={styles.idGameCoverFrame}>
                <Image
                  resizeMode="contain"
                  source={game.cover}
                  style={[
                    styles.idGameCover,
                    { transform: [{ scale: game.coverScale }] },
                  ]}
                />
              </View>
              <TextInput
                accessibilityLabel={`${t('codeId')} ${game.name}`}
                onChangeText={(value) => onChangeId(game.key, value)}
                placeholder={t('codeId')}
                placeholderTextColor="#C4C5CA"
                style={[styles.idInput, isDark && { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={gameIds[game.key] ?? ''}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <PrimaryButton label={t('register')} onPress={onRegister} />
    </View>
  );
}

function PrimaryButton({ disabled = false, label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        pressed && styles.primaryButtonPressed,
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function EmptyUsers({ onAdd }) {
  const { colors, isDark, t } = useAppTheme();
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyMessage, isDark && { color: colors.text }]}>{t('emptyUsers')}</Text>

      <AddButton onPress={onAdd} />
    </View>
  );
}

function AddButton({ compact = false, onPress }) {
  const { t } = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={t('createUser')}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.addButton,
        !compact && styles.addButtonSpaced,
        pressed && styles.addButtonPressed,
      ]}
    >
      <Text style={styles.addButtonText}>+</Text>
    </Pressable>
  );
}

function UserCard({ onMenu, user }) {
  const { t } = useAppTheme();
  const selectedGameData = GAMES.filter((game) => user.games.includes(game.key));

  return (
    <View style={styles.userCard}>
      <ProfileOutlineIcon size={47} />

      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text numberOfLines={1} style={styles.userName}>
            {user.fullName}
          </Text>
          <Pressable
            accessibilityLabel={`${t('openMenu')} ${user.fullName}`}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onMenu}
            style={({ pressed }) => [
              styles.userMenuPill,
              pressed && styles.userMenuPillPressed,
            ]}
          >
            <HamburgerIcon />
          </Pressable>
        </View>
        <Text style={styles.userId}>ID: {user.nickname}</Text>
        <View style={styles.userGames}>
          {selectedGameData.map((game) => (
            <View key={game.key} style={styles.userGameIconFrame}>
              <Image
                accessibilityLabel={`${game.name}: ${user.gameIds[game.key] || t('idMissing')}`}
                resizeMode="contain"
                source={game.icon}
                style={[
                  styles.userGameIcon,
                  { transform: [{ scale: game.iconScale }] },
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.creditsColumn}>
        <View style={styles.creditBlock}>
          <Text style={styles.creditValue}>{user.sideQuestCredits ?? 30}</Text>
          <Text style={styles.creditLabel}>SQ {t('credits')}</Text>
        </View>
        <View style={[styles.creditBlock, styles.creditBlockBottom]}>
          <Text style={styles.creditValue}>{user.gameManiaCredits ?? 30}</Text>
          <Text style={styles.creditLabel}>GM {t('credits')}</Text>
        </View>
      </View>
    </View>
  );
}

function GameFilterChip({ game, onPress, selected }) {
  const { colors, isDark, t } = useAppTheme();
  const fillProgress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(fillProgress, {
      toValue: selected ? 1 : 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [fillProgress, selected]);

  const fillWidth = fillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 68],
  });

  return (
    <Pressable
      accessibilityLabel={`${t('filter')} ${game.name}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        isDark && { backgroundColor: colors.card },
        pressed && styles.pressed,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.filterChipFill, { width: fillWidth }]}
      />
      <View style={styles.filterIconFrame}>
        <Image
          resizeMode="contain"
          source={game.icon}
          style={styles.filterIcon}
        />
      </View>
    </Pressable>
  );
}

function UsersList({
  activeGameKeys,
  filters,
  onAdd,
  onFilter,
  onSearch,
  onUserMenu,
  search,
  users,
}) {
  const { colors, isDark, t } = useAppTheme();
  const visibleUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesText =
        normalizedSearch.length === 0 ||
        user.fullName.toLowerCase().includes(normalizedSearch) ||
        user.nickname.toLowerCase().includes(normalizedSearch);
      const matchesGame =
        filters.length === 0 ||
        filters.every((gameKey) => user.games.includes(gameKey));

      return matchesText && matchesGame;
    });
  }, [filters, search, users]);

  return (
    <View style={styles.usersListScreen}>
      <View style={styles.searchRow}>
        <TextInput
          onChangeText={onSearch}
          placeholder={t('searchUsername')}
          placeholderTextColor="#E1E3E9"
          style={[styles.searchInput, isDark && { backgroundColor: colors.card, color: colors.text }]}
          value={search}
        />
        <View style={styles.searchButton}>
          <Text style={styles.searchButtonText}>{t('search')}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.filters}
        horizontal
        persistentScrollbar
        scrollIndicatorInsets={{ left: 4, right: 4 }}
        showsHorizontalScrollIndicator
        style={styles.filtersScroller}
      >
        {GAMES.filter((game) => activeGameKeys.has(game.key)).map((game) => {
          const selected = filters.includes(game.key);

          return (
            <GameFilterChip
              game={game}
              key={game.key}
              onPress={() => onFilter(game.key)}
              selected={selected}
            />
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.userCards}
        showsVerticalScrollIndicator={false}
      >
        {visibleUsers.map((user) => (
          <UserCard
            key={user.key}
            onMenu={() => onUserMenu(user)}
            user={user}
          />
        ))}

        {visibleUsers.length === 0 && (
          <Text style={[styles.noResults, isDark && { color: colors.text }]}>{t('noUsers')}</Text>
        )}
      </ScrollView>

      <View style={styles.usersFooter}>
        <Text style={[styles.totalUsers, isDark && { color: colors.text }]}>{users.length} {t('totalPlural')}</Text>
        <View style={styles.usersFooterAdd}>
          <AddButton compact onPress={onAdd} />
        </View>
      </View>
    </View>
  );
}

export default function Users({ activeGameKeys, navigation }) {
  const { colors, isDark, t } = useAppTheme();
  const blurTargetRef = useRef(null);
  const [mode, setMode] = useState('list');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedGames, setSelectedGames] = useState([]);
  const [gameIds, setGameIds] = useState({});
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditUserKey, setCreditUserKey] = useState(null);
  const [creditDraft, setCreditDraft] = useState({
    sideQuest: 10,
    gameMania: 10,
  });
  const [creditHistoryBrand, setCreditHistoryBrand] = useState(null);

  useEffect(() => {
    setFilters((currentFilters) =>
      currentFilters.filter((gameKey) => activeGameKeys.has(gameKey)),
    );
  }, [activeGameKeys]);

  const startRegistration = () => {
    setSelectedUser(null);
    setForm(EMPTY_FORM);
    setSelectedGames([]);
    setGameIds({});
    setStep(1);
    setMode('registration');
  };

  const handleBack = () => {
    if (selectedUser) {
      setSelectedUser(null);
      return;
    }

    if (mode === 'credit') {
      setCreditUserKey(null);
      setMode('list');
      return;
    }

    if (mode === 'creditHistory') {
      setCreditHistoryBrand(null);
      setMode('credit');
      return;
    }

    if (mode === 'registration') {
      if (step > 1) {
        setStep((currentStep) => currentStep - 1);
      } else {
        setMode('list');
      }
      return;
    }

    navigation.navigate('Home');
  };

  const updateForm = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const toggleGame = (gameKey) => {
    setSelectedGames((currentGames) =>
      currentGames.includes(gameKey)
        ? currentGames.filter((key) => key !== gameKey)
        : [...currentGames, gameKey],
    );
  };

  const toggleFilter = (gameKey) => {
    setFilters((currentFilters) =>
      currentFilters.includes(gameKey)
        ? currentFilters.filter((key) => key !== gameKey)
        : [...currentFilters, gameKey],
    );
  };

  const openCreditEditor = (user) => {
    setCreditUserKey(user.key);
    setCreditDraft({ sideQuest: 10, gameMania: 10 });
    setSelectedUser(null);
    setMode('credit');
  };

  const openCreditHistory = (brand) => {
    setCreditHistoryBrand(brand);
    setMode('creditHistory');
  };

  const saveCredits = () => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.key === creditUserKey
          ? {
              ...user,
              gameManiaCredits: Number(creditDraft.gameMania) || 0,
              sideQuestCredits: Number(creditDraft.sideQuest) || 0,
            }
          : user,
      ),
    );
    setCreditUserKey(null);
    setMode('list');
  };

  const registerUser = () => {
    const fallbackId = String(Date.now()).slice(-8);

    setUsers((currentUsers) => [
      ...currentUsers,
      {
        key: `${Date.now()}-${currentUsers.length}`,
        fullName: form.fullName.trim() || 'Nome Cognome',
        nickname: form.nickname.trim() || fallbackId,
        games: selectedGames,
        gameIds: { ...gameIds },
      },
    ]);
    setMode('list');
    setStep(1);
    setSearch('');
    setFilters([]);
  };

  const showEmptyState = mode === 'list' && users.length === 0;
  const showUsersList = mode === 'list' && users.length > 0;
  const creditUser = users.find((user) => user.key === creditUserKey);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <BlurTargetView ref={blurTargetRef} style={[styles.screen, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
          <AppHeader onBack={handleBack} />

          {showEmptyState && <EmptyUsers onAdd={startRegistration} />}

          {showUsersList && (
            <UsersList
              activeGameKeys={activeGameKeys}
              filters={filters}
              onAdd={startRegistration}
              onFilter={toggleFilter}
              onSearch={setSearch}
              onUserMenu={setSelectedUser}
              search={search}
              users={users}
            />
          )}

          {mode === 'credit' && (
            <CreditScreen
              credits={creditDraft}
              onChange={(brand, value) =>
                setCreditDraft((currentCredits) => ({
                  ...currentCredits,
                  [brand]: value,
                }))
              }
              onHistory={openCreditHistory}
              onSave={saveCredits}
              userName={creditUser?.fullName || 'Nome Cognome'}
            />
          )}

          {mode === 'creditHistory' && creditHistoryBrand && (
            <CreditHistoryScreen
              brand={creditHistoryBrand}
              userName={creditUser?.fullName || 'Nome Cognome'}
              value={
                creditHistoryBrand === 'sidequest'
                  ? creditDraft.sideQuest
                  : creditDraft.gameMania
              }
            />
          )}

          {mode === 'registration' && (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.registrationArea}
            >
              <ScrollView
                contentContainerStyle={styles.registrationContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Stepper currentStep={step} />

                {step === 1 && (
                  <UserDataStep
                    form={form}
                    onChange={updateForm}
                    onNext={() => setStep(2)}
                  />
                )}

                {step === 2 && (
                  <GameSelectionStep
                    onNext={() => setStep(3)}
                    onToggle={toggleGame}
                    selectedGames={selectedGames}
                  />
                )}

                {step === 3 && (
                  <GameIdsStep
                    gameIds={gameIds}
                    onChangeId={(gameKey, value) =>
                      setGameIds((currentIds) => ({
                        ...currentIds,
                        [gameKey]: value,
                      }))
                    }
                    onRegister={registerUser}
                    selectedGames={selectedGames}
                  />
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          )}

          <StatusBar style={isDark ? 'light' : 'dark'} />
        </SafeAreaView>
      </BlurTargetView>

      {selectedUser && (
        <UserPopup
          blurTarget={blurTargetRef}
          onClose={() => setSelectedUser(null)}
          onCredit={() => openCreditEditor(selectedUser)}
          user={selectedUser}
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
  pressed: {
    opacity: 0.65,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 70,
  },
  emptyMessage: {
    color: '#2E57A8',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    textAlign: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#587CC4',
  },
  addButtonSpaced: {
    marginTop: 28,
  },
  addButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  addButtonText: {
    marginTop: -2,
    color: '#fff',
    fontSize: 35,
    fontWeight: '300',
    lineHeight: 40,
  },
  registrationArea: {
    flex: 1,
  },
  registrationContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  stepLayout: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 10,
  },
  stepper: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperPart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepLine: {
    width: 36,
    height: 2,
    backgroundColor: '#3159AD',
  },
  stepCircle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3159AD',
    borderRadius: 19,
    backgroundColor: '#DEDEDE',
  },
  stepCircleActive: {
    backgroundColor: '#3159AD',
  },
  stepNumber: {
    color: '#3159AD',
    fontSize: 19,
    fontWeight: '800',
  },
  stepNumberActive: {
    color: '#fff',
  },
  formPanel: {
    flex: 1,
    width: '92%',
    maxWidth: 390,
    minHeight: 410,
    maxHeight: 470,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 21,
    paddingHorizontal: 22,
    borderRadius: 13,
    backgroundColor: '#5879BC',
  },
  formFields: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  formInput: {
    width: '72%',
    minWidth: 205,
    height: 41,
    paddingHorizontal: 15,
    borderRadius: 21,
    backgroundColor: '#fff',
    color: '#263652',
    fontSize: 14,
    textAlign: 'center',
    outlineWidth: 0,
  },
  primaryButton: {
    minWidth: 165,
    minHeight: 43,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderRadius: 22,
    backgroundColor: '#2E59B1',
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  gameSelectionPanel: {
    flex: 1,
    width: '92%',
    maxWidth: 350,
    minHeight: 390,
    maxHeight: 490,
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 13,
    backgroundColor: '#5879BC',
  },
  panelTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  gameChoices: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 6,
  },
  stepScroll: {
    width: '100%',
  },
  gameChoice: {
    width: '100%',
    maxWidth: 252,
    height: 72,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  gameChoiceSelected: {
    backgroundColor: '#ADF8FF',
  },
  gameCoverFrame: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  gameCover: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  riftboundGameCover: {
    marginBottom: 5,
  },
  idsPanel: {
    flex: 1,
    width: '92%',
    maxWidth: 390,
    minHeight: 400,
    maxHeight: 490,
    alignItems: 'center',
    gap: 18,
    paddingVertical: 21,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: '#5879BC',
  },
  idCards: {
    alignItems: 'center',
    gap: 22,
    paddingBottom: 4,
  },
  idCard: {
    width: 210,
    minHeight: 98,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#2E59B1',
    borderRadius: 19,
    backgroundColor: '#ADF8FF',
  },
  idGameCoverFrame: {
    width: 152,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  idGameCover: {
    width: '100%',
    height: '100%',
  },
  idInput: {
    width: 152,
    height: 31,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#B8B9C0',
    borderRadius: 16,
    backgroundColor: '#fff',
    color: '#263652',
    fontSize: 13,
    textAlign: 'center',
    outlineWidth: 0,
  },
  usersListScreen: {
    flex: 1,
    paddingHorizontal: 9,
    paddingBottom: 10,
  },
  searchRow: {
    width: '84%',
    maxWidth: 370,
    height: 35,
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: '#95A7CB',
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 13,
    outlineWidth: 0,
  },
  searchButton: {
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#3159AD',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 13,
  },
  filtersScroller: {
    width: '100%',
    flexGrow: 0,
    marginTop: 22,
    marginBottom: 15,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingLeft: 4,
    paddingRight: 42,
    paddingBottom: 10,
  },
  filterChip: {
    position: 'relative',
    width: 68,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  filterChipFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 22,
    backgroundColor: '#ADF8FF',
  },
  filterIconFrame: {
    zIndex: 1,
    width: 54,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    width: '100%',
    height: '100%',
  },
  userCards: {
    gap: 12,
    paddingBottom: 12,
  },
  userCard: {
    width: '100%',
    minHeight: 98,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingLeft: 18,
    borderRadius: 17,
    backgroundColor: '#5372B5',
    overflow: 'hidden',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  userMenuPill: {
    width: 42,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#3159AD',
  },
  userMenuPillPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  userId: {
    color: '#DCE4F5',
    fontSize: 11,
  },
  userGames: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  userGameIconFrame: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  userGameIcon: {
    width: '100%',
    height: '100%',
  },
  creditsColumn: {
    width: 80,
    alignSelf: 'stretch',
    backgroundColor: '#3159AD',
  },
  creditBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#7894D0',
  },
  creditBlockBottom: {
    borderBottomWidth: 0,
  },
  creditValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 25,
  },
  creditLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  noResults: {
    marginTop: 35,
    color: '#3159AD',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  usersFooter: {
    position: 'relative',
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  usersFooterAdd: {
    position: 'absolute',
    top: 8,
    right: 18,
  },
  totalUsers: {
    color: '#3159AD',
    fontSize: 22,
    fontWeight: '900',
  },
  creditEditorScreen: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 38,
    paddingBottom: 28,
  },
  creditEditorScroll: {
    flex: 1,
  },
  creditEditorTitle: {
    color: '#6A504D',
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
  },
  creditEditorCards: {
    width: '100%',
    alignItems: 'center',
    gap: 34,
    marginTop: 40,
  },
  creditEditorCardShadow: {
    width: '88%',
    maxWidth: 370,
    minWidth: 290,
    height: 238,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 5 },
    shadowOpacity: 0.27,
    shadowRadius: 6,
    elevation: 8,
  },
  creditEditorCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  creditEditorCardTop: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingRight: 12,
    paddingTop: 5,
  },
  creditEditorLogo: {
    width: 282,
    aspectRatio: 169 / 59,
    alignSelf: 'flex-start',
  },
  creditEditorGameManiaLogo: {
    width: 302,
    aspectRatio: 3,
  },
  creditTransactionDescription: {
    width: '76%',
    height: 28,
    alignSelf: 'flex-start',
    marginTop: -5,
    marginLeft: 25,
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.8)',
    color: '#fff',
    fontSize: 12,
    outlineWidth: 0,
  },
  creditEditorControls: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
    paddingLeft: 25,
    paddingRight: 8,
  },
  creditAdjustmentArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  creditAdjustmentInput: {
    width: 48,
    height: 31,
    padding: 0,
    borderRadius: 9,
    backgroundColor: '#fff',
    color: '#24334D',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    outlineWidth: 0,
  },
  creditEditorControl: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  creditEditorControlDisabled: {
    opacity: 0.45,
  },
  creditEditorControlPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.92 }],
  },
  creditEditorControlText: {
    marginTop: -2,
    color: '#24334D',
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 25,
  },
  creditTotalArea: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 78,
  },
  creditTotalLabel: {
    marginBottom: -5,
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  creditEditorValue: {
    minWidth: 78,
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 43,
    textAlign: 'right',
  },
  creditEditorFooter: {
    height: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 29,
  },
  creditEditorFooterSideQuest: {
    backgroundColor: '#4268BB',
  },
  creditEditorFooterGameMania: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  creditEditorUserName: {
    flex: 1,
    marginRight: 14,
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  creditEditorHistoryButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  creditEditorHistoryButtonPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.94 }],
  },
  creditHistoryScreen: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 38,
    paddingBottom: 28,
  },
  creditHistorySummary: {
    width: '88%',
    maxWidth: 370,
    minWidth: 290,
    minHeight: 154,
    marginTop: 38,
    paddingRight: 12,
    paddingTop: 15,
    paddingBottom: 17,
    borderRadius: 23,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 7,
  },
  creditHistoryLogo: {
    width: 250,
    aspectRatio: 169 / 59,
    alignSelf: 'flex-start',
  },
  creditHistoryGameManiaLogo: {
    width: 265,
    aspectRatio: 3,
  },
  creditHistoryBalanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  creditHistoryUserBlock: {
    flex: 1,
    minWidth: 0,
    marginRight: 14,
  },
  creditHistoryUserName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
  },
  creditHistoryBalanceLabel: {
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 12,
    fontWeight: '700',
  },
  creditHistoryBalance: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 44,
  },
  creditHistoryPanel: {
    width: '88%',
    maxWidth: 370,
    minWidth: 290,
    marginTop: 25,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
  },
  creditHistoryPanelTitle: {
    marginBottom: 7,
    color: '#283F70',
    fontSize: 15,
    fontWeight: '900',
  },
  creditHistoryMovement: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8EE',
  },
  creditHistoryMovementLast: {
    borderBottomWidth: 0,
  },
  creditHistoryMovementInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  creditHistoryMovementLabel: {
    color: '#263652',
    fontSize: 14,
    fontWeight: '800',
  },
  creditHistoryMovementDate: {
    marginTop: 3,
    color: '#8790A1',
    fontSize: 10,
    fontWeight: '700',
  },
  creditHistoryAmountPill: {
    minWidth: 48,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderRadius: 15,
  },
  creditHistoryAmountPositive: {
    backgroundColor: '#4AB575',
  },
  creditHistoryAmountNegative: {
    backgroundColor: '#C46E6B',
  },
  creditHistoryAmountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  creditEditorSave: {
    width: 192,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    borderRadius: 25,
    backgroundColor: '#3159AD',
  },
  creditEditorSavePressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  creditEditorSaveText: {
    color: '#fff',
    fontSize: 27,
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
    width: '88%',
    maxWidth: 330,
    minHeight: 292,
    alignItems: 'center',
    paddingTop: 23,
    paddingBottom: 25,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.34,
    shadowRadius: 7,
    elevation: 9,
  },
  popupTitle: {
    width: '100%',
    paddingHorizontal: 62,
    color: '#20365F',
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
  popupClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#C96F70',
  },
  popupClosePressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },
  popupCloseText: {
    marginTop: -3,
    color: '#fff',
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 40,
  },
  popupActions: {
    width: '100%',
    alignItems: 'center',
    gap: 13,
    marginTop: 20,
  },
  popupAction: {
    width: '61%',
    minWidth: 180,
    maxWidth: 202,
    height: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
    borderRadius: 21.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  popupActionCredit: {
    backgroundColor: '#F5C330',
  },
  popupActionGames: {
    backgroundColor: '#283F70',
  },
  popupActionEdit: {
    backgroundColor: '#5379C4',
  },
  popupActionPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  popupActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
});
