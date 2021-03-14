import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Button, Input, Text} from 'react-native-elements';
import {SocialIcon} from 'react-native-elements/dist/social/SocialIcon';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {Avatar} from 'react-native-elements/dist/avatar/Avatar';

GoogleSignin.configure();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 8,
    marginBottom: 60,
  },
  button: {
    marginTop: 8,
  },
  socialButton: {
    paddingHorizontal: 20,
  },
  avatar: {
    backgroundColor: '#BCBEC1',
  },
});

type CenteredProps = {
  children: React.ReactNode;
};

const Centered = ({children}: CenteredProps) => (
  <View style={styles.container}>{children}</View>
);

type User = {
  displayName: string | null | undefined;
  email: string | null | undefined;
  photoURL: string | null | undefined;
};

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [formState, setFormState] = useState<{email: string; password: string}>(
    {
      email: '',
      password: '',
    },
  );

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((userState) => {
      if (userState) {
        setUser({
          displayName: userState?.displayName,
          email: userState?.email,
          photoURL: userState?.photoURL,
        });
      }
    });

    setLoading(false);

    return unsubscribe;
  }, []);

  const handleLogin = () => {
    if (!formState.email || !formState.password) {
      Alert.alert('all fields required!');
      return;
    }

    setSubmitLoading(true);
    auth()
      .signInWithEmailAndPassword(formState.email, formState.password)
      .finally(() => {
        setSubmitLoading(false);
      });
  };

  const handleSignup = () => {
    if (!formState.email || !formState.password) {
      Alert.alert('all fields required!');
      return;
    }

    auth()
      .createUserWithEmailAndPassword(formState.email, formState.password)
      .then(() => {
        setIsCreatingAccount(false);
      });
  };

  const handleGoogleSigin = async () => {
    await GoogleSignin.hasPlayServices();
    const data = await GoogleSignin.signIn();
    setUser({
      displayName: data.user.name,
      email: data.user.email,
      photoURL: data.user.photo,
    });
  };

  const handleSignout = () => {
    auth()
      .signOut()
      .catch((error) => {
        if (error.code === 'auth/no-current-user') {
          setUser(null);
        }
      });
  };

  if (loading) {
    return null;
  }

  if (isCreatingAccount) {
    return (
      <Centered>
        <Text h3 style={styles.title}>
          Create and account
        </Text>
        <Input
          onChangeText={(text) =>
            setFormState((prevState) => ({...prevState, email: text}))
          }
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="e-mail"
          leftIcon={{name: 'email'}}
        />
        <Input
          onChangeText={(text) =>
            setFormState((prevState) => ({...prevState, password: text}))
          }
          secureTextEntry
          placeholder="password"
          leftIcon={{name: 'lock'}}
        />
        <Button
          style={styles.button}
          loading={submitLoading}
          onPress={handleSignup}
          title="Sign up"
        />

        <Button
          style={styles.button}
          title="Go back"
          onPress={() => setIsCreatingAccount(false)}
        />
      </Centered>
    );
  }

  if (!user) {
    return (
      <Centered>
        <Text h3 style={styles.title}>
          Login
        </Text>
        <Input
          onChangeText={(text) =>
            setFormState((prevState) => ({...prevState, email: text}))
          }
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="e-mail"
          leftIcon={{name: 'email'}}
        />
        <Input
          onChangeText={(text) =>
            setFormState((prevState) => ({...prevState, password: text}))
          }
          secureTextEntry
          placeholder="password"
          leftIcon={{name: 'lock'}}
        />
        <Button
          style={styles.button}
          onPress={handleLogin}
          loading={submitLoading}
          title="Sign in"
        />
        <SocialIcon
          raised
          iconType="font-awesome"
          iconColor="white"
          iconSize={24}
          onPress={handleGoogleSigin}
          style={styles.socialButton}
          title="Sign In With Google"
          button
          type="google"
        />
        <Button
          style={styles.button}
          onPress={() => setIsCreatingAccount(true)}
          title="Create an account"
        />
      </Centered>
    );
  }
  return (
    <Centered>
      <Avatar
        containerStyle={styles.avatar}
        rounded
        icon={{name: 'home'}}
        source={user.photoURL ? {uri: user.photoURL} : {}}
      />

      <Text style={styles.title}>
        Welcome {user.displayName || user.email}!
      </Text>
      <Button onPress={handleSignout} title="Sign out" />
    </Centered>
  );
}

export default App;
