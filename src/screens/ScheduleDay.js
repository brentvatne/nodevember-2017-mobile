import React from 'react';
import {
  Text,
  SectionList,
  StyleSheet,
  View,
  AsyncStorage,
} from 'react-native';
import { NavigationActions, StackNavigator } from 'react-navigation';
import { ScrollView, RectButton } from 'react-native-gesture-handler';
import _ from 'lodash';

import { connectTopNavigation } from '../Navigation';
import { RegularText, SemiBoldText, BoldText } from '../components/StyledText';
import { Colors, Layout } from '../constants';
import MenuButton from '../components/MenuButton';
import SaveButton from '../components/SaveButton';

import FullSchedule from '../data/schedule.json';

class ScheduleRow extends React.Component {
  render() {
    const { item } = this.props;

    return (
      <RectButton
        activeOpacity={0.05}
        onPress={this._handlePress}
        style={{ flex: 1, backgroundColor: '#fff' }}
      >
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <BoldText>{item.title}</BoldText>
            {item.speaker ? <SemiBoldText>{item.speaker}</SemiBoldText> : null}
            <RegularText>{item.room}</RegularText>
          </View>
          <View style={styles.actions}>
            <SaveButton
              active={this.props.saved}
              savePress={this.props.toggleSaved}
            />
          </View>
        </View>
      </RectButton>
    );
  }

  _handlePress = () => {
    this.props.onPress && this.props.onPress(this.props.item);
  };
}

export default function ScheduleDay(options) {
  const schedule = _.find(
    FullSchedule,
    schedule => schedule.title === options.day
  );
  const slotsByTime = _.groupBy(schedule.slots, slot => slot.time);
  const slotsData = _.map(slotsByTime, (data, time) => {
    return { data, title: time };
  });

  @connectTopNavigation
  class ScheduleDayComponent extends React.Component {
    static navigationOptions = {
      title: `${options.day} Schedule`,
      headerStyle: { backgroundColor: Colors.green },
      headerTintColor: 'white',
      headerLeft: <MenuButton />,
      tabBarLabel: options.day,
      tabBarIcon: ({ tintColor }) => (
        <BoldText style={{ fontSize: 20, color: tintColor }}>
          {options.date}
        </BoldText>
      ),
    };
    static savedTalksStorageKey = '@ScheduleDayComponent:savedTalks';
    state = {
      savedTalks: {},
    };

    componentDidMount() {
      this._loadSavedTalks();
    }

    render() {
      return (
        <SectionList
          renderScrollComponent={props => <ScrollView {...props} />}
          stickySectionHeadersEnabled={true}
          renderItem={this._renderItem}
          renderSectionHeader={this._renderSectionHeader}
          sections={slotsData}
          keyExtractor={item => _.snakeCase(item.title)}
        />
      );
    }

    _renderSectionHeader = ({ section }) => {
      return (
        <View style={styles.sectionHeader}>
          <RegularText>{section.title}</RegularText>
        </View>
      );
    };

    _renderItem = ({ item }) => {
      const key = _.snakeCase(item.title);
      return (
        <ScheduleRow
          item={item}
          onPress={this._handlePressRow}
          saved={this.state.savedTalks[key]}
          toggleSaved={this._handleSaveToggle.bind(this, key)}
        />
      );
    };

    _handlePressRow = item => {
      this.props.topNavigation.navigate('Details', { scheduleSlot: item });
    };

    _handleSaveToggle = key => {
      this.setState(
        state => ({
          savedTalks: {
            ...state.savedTalks,
            [key]: !state.savedTalks[key],
          },
        }),
        this._storeSavedTalks
      );
    };

    _loadSavedTalks = () => {
      AsyncStorage.getItem(
        ScheduleDayComponent.savedTalksStorageKey
      ).then(value => {
        if (value) {
          this.setState({
            savedTalks: JSON.parse(value),
          });
        }
      });
    };

    _storeSavedTalks = () => {
      AsyncStorage.setItem(
        ScheduleDayComponent.savedTalksStorageKey,
        JSON.stringify(this.state.savedTalks)
      );
    };
  }

  return StackNavigator(
    {
      Day: {
        screen: ScheduleDayComponent,
      },
    },
    {
      cardStyle: {
        backgroundColor: '#fafafa',
      },
      navigationOptions: {
        headerTitleStyle: {
          fontFamily: 'open-sans-bold',
        },
      },
    }
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  sectionHeader: {
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 5,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#eee',
  },
  content: {
    width: Layout.window.width * 0.8,
  },
});
