import React from 'react';
import { Font, Constants } from 'expo';
import { View, StatusBar } from 'react-native';
import glamorous, { ThemeProvider } from 'glamorous-native';
import LandingScreen from './src/components/LandingScreen';

const theme = {
  font: {
    primary: 'open-sans-bold',
  },
  colors: {
    main: '#187f65',
  },
};

const StatusBarPlaceholder = glamorous.view(
  {
    height: Constants.statusBarHeight,
  },
  (_, { colors }) => ({
    backgroundColor: colors.main,
  })
);

export default class App extends React.Component {
  state = {
    fontLoaded: false,
  };
  async componentDidMount() {
    await Font.loadAsync({
      'open-sans-bold': require('./src/assets/OpenSans-Bold.ttf'),
      'orbitron-bold': require('./src/assets/Orbitron-Bold.ttf'),
    });
    this.setState({
      fontLoaded: true,
    });
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <View>
          <StatusBar barStyle="light-content" backgroundColor="#187f65" />
          <StatusBarPlaceholder />
          {this.state.fontLoaded && <LandingScreen />}
        </View>
      </ThemeProvider>
    );
  }
}
