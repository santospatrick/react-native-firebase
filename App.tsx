import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {Button, Input, Text} from 'react-native-elements';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 60,
  },
  button: {
    marginTop: 8,
  },
});

type CenteredProps = {
  children: React.ReactNode;
};

const Centered = ({children}: CenteredProps) => (
  <View style={styles.container}>{children}</View>
);

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [formState, setFormState] = useState<{email: string; password: string}>(
    {
      email: '',
      password: '',
    },
  );

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((userState) => {
      setUser(userState);

      if (loading) {
        setLoading(false);
      }
    });

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
      .then((data) => {
        setUser(data.user);
      })
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
      .then((data) => {
        setUser(data.user);
        setIsCreatingAccount(false);
      });
  };

  const handleSignout = () => {
    auth().signOut();
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
      <Text h4 style={styles.title}>
        Welcome {user.email}
      </Text>
      <Button onPress={handleSignout} title="Sign out" />
    </Centered>
  );
}

export default App;
