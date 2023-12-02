import styles from './page.module.css'
import React from 'react';
import { any, string, z } from 'zod'
import { createClient} from '@supabase/supabase-js';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const schema = z.object({
	first_name: string(),
	last_name: string(),
	email: string().email(),
	phone: string(),//.regex(new RegExp("^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/"), 'not valid number'),
	profile_img: any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
	address: string(),
	zip_code: string().max(10),
	country: string()
  });

export default function Home() {
	async function submit (formData: FormData)
	{
		'use server'

		const parsed = schema.parse({
			first_name: formData.get('first_name'),
			last_name: formData.get('last_name'),
			email: formData.get('email'),
			phone: formData.get('phone'),
			profile_img: formData.get('profile_img'),
			address: formData.get('address'),
			zip_code: formData.get('zip_code'),
			country: formData.get('country')
		});
		console.log(parsed);
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
		const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
		
		const supabase = createClient(supabaseUrl, supabaseAnonKey);
		const data1 = await supabase.storage.from('test.images').upload(parsed.profile_img.name, parsed.profile_img);
		const data2 = supabase.storage.from('test.images').getPublicUrl(parsed.profile_img.name);
		const data3 = await supabase.from('customer').insert({
			first_name: parsed.first_name,
			last_name: parsed.last_name,
			email: parsed.email,
			phone: parsed.phone,
			profile_img: data2.data.publicUrl,
			address: parsed.address,
			zip_code: parsed.zip_code,
			country: parsed.country,
		});
	}
	
	return (
    <main className={styles.main}>
      <form action={submit} className={styles.form}>
		<label>Prenom</label>
		<input required type="text" name="first_name"></input>
		<label>Nom</label>
		<input required type="text" name="last_name"></input>
		<label>Email</label>
		<input required type="email" name="email"></input>
		<label>Phone number</label>
		<input required type="tel" name="phone"></input>
		<label>Profile Image</label>
		<input required type="file" accept='image/*' name="profile_img"></input>
		<label>Address</label>
		<input required type="text" name="address"></input>
		<label>Zip Code</label>
		<input required type="text" name="zip_code"></input>
		<label>Country</label>
		<input required type="text" name="country"></input>
		<input type="submit"></input>
	  </form>
    </main>
  )
}
