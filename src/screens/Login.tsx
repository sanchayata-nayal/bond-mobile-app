import React from 'react';
import { View, Text } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { useForm, Controller } from 'react-hook-form';
import PasswordInput from '../components/PasswordInput';

export default function Login({ navigation }: any) {
  const { control, handleSubmit } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = (data: any) => {
    navigation.reset({ index: 0, routes: [{ name: 'UserLanding' }] });
  };

  return (
    <ScreenContainer>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Login</Text>

      <Controller control={control} name="email" render={({ field }) => <AppInput placeholder="Email" icon="mail" {...field} />} />
      <Controller control={control} name="password" render={({ field }) => <PasswordInput placeholder="Password" value={field.value} onChangeText={field.onChange} />} />

      <AppButton title="Login" onPress={handleSubmit(onSubmit)} />

      <Text style={{ color: '#aaa', marginTop: 12 }} onPress={() => navigation.navigate('SignUp')}>Forgot Password?</Text>
    </ScreenContainer>
  );
}