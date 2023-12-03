import styles from './page.module.css'
import React from 'react';
import { any, string, z } from 'zod'
import { createClient} from '@supabase/supabase-js';
const sanitizer = require('sanitize')();

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
			first_name: sanitizer.value(formData.get('first_name')),
			last_name: sanitizer.value(formData.get('last_name')),
			email: sanitizer.value(formData.get('email')),
			phone: sanitizer.value(formData.get('phone')),
			profile_img: sanitizer.value(formData.get('profile_img')),
			address: sanitizer.value(formData.get('address')),
			zip_code: sanitizer.value(formData.get('zip_code')),
			country: sanitizer.value(formData.get('country'))
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
		<div className={styles.input_pair} id={styles.first_name}>
			<label>Prenom</label>
			<input required type="text" name="first_name"></input>
		</div>
		<div className={styles.input_pair} id={styles.last_name}>
			<label>Nom</label>
			<input required type="text" name="last_name"></input>
		</div>
		<div className={styles.input_pair} id={styles.email}>
			<label>Email</label>
			<input required type="email" name="email"></input>
		</div>
		<div className={styles.input_pair} id={styles.phone}>
			<label>Telephone</label>
			<input required type="tel" name="phone"></input>
		</div>
		<div className={styles.input_pair} id={styles.country}>
			<label>Ville</label>
			<input required type="text" name="country"></input>
		</div>
		<div className={styles.input_pair} id={styles.address}>
			<label>Addresse</label>
			<input required type="text" name="address"></input>
		</div>
		<div className={styles.input_pair} id={styles.zip}>
			<label>ZIP</label>
			<input required type="text" name="zip_code"></input>
		</div>
		<div className={styles.input_pair} id={styles.profile_img}>
			<label>Image de profile</label>
			<input required type="file" accept='image/*' name="profile_img"></input>
		</div>
		<input type="submit" id={styles.submit}></input>
	  </form>
    </main>
  )
}
