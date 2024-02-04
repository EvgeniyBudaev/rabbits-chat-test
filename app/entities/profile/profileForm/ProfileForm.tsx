"use client";

import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import { redirect } from "next/navigation";
import { type FC, useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { addProfileAction } from "@/app/actions/profile/add/addProfileAction";
import { editProfileAction } from "@/app/actions/profile/edit/editProfileAction";
import type { TProfile } from "@/app/api/profile/add";
import { useTranslation } from "@/app/i18n/client";
import { EFormFields } from "@/app/pages/profileAddPage/enums";
import { Section } from "@/app/shared/components/section";
import { Field } from "@/app/shared/components/form/field";
import { FileUploader } from "@/app/shared/components/form/fileUploader";
import { Header } from "@/app/shared/components/header";
import { SidebarContent } from "@/app/shared/components/sidebarContent";
import { DEFAULT_LANGUAGE } from "@/app/shared/constants/language";
import { ELanguage, ERoutes } from "@/app/shared/enums";
import { useFiles, useTelegram } from "@/app/shared/hooks";
import { GENDER_MAPPING } from "@/app/shared/mapping/gender";
import { LANGUAGE_MAPPING } from "@/app/shared/mapping/language";
import { LOOKING_FOR_MAPPING } from "@/app/shared/mapping/lookingFor";
import { SEARCH_GENDER_MAPPING } from "@/app/shared/mapping/searchGender";
import type { TFile } from "@/app/shared/types/file";
import { createPath } from "@/app/shared/utils";
import { Container } from "@/app/shared/components/container";
import { formattedDate } from "@/app/shared/utils/date";
import { Error } from "@/app/uikit/components/error";
import { Input } from "@/app/uikit/components/input";
import { InputDateField } from "@/app/uikit/components/inputDateField";
import { Select, type TSelectOption } from "@/app/uikit/components/select";
import { Textarea } from "@/app/uikit/components/textarea";
import "./ProfileForm.scss";

type TProps = {
  isEdit?: boolean;
  profile?: TProfile;
};

export const ProfileForm: FC<TProps> = ({ isEdit, profile }) => {
  const initialState = {
    data: undefined,
    error: undefined,
    errors: undefined,
    success: false,
  };
  const [state, formAction] = useFormState(
    isEdit ? editProfileAction : addProfileAction,
    initialState,
  );
  const buttonSubmitRef = useRef<HTMLInputElement>(null);
  const { queryId, user } = useTelegram();
  const { t } = useTranslation("index");
  const language = (user?.language_code as ELanguage) ?? DEFAULT_LANGUAGE;
  const genderDefault = isEdit
    ? GENDER_MAPPING[language].find((item) => item.value === profile?.gender)
    : undefined;
  const searchGenderDefault = isEdit
    ? SEARCH_GENDER_MAPPING[language].find(
        (item) => item.value === profile?.searchGender,
      )
    : undefined;
  const lookingForDefault = isEdit
    ? LOOKING_FOR_MAPPING[language].find(
        (item) => item.value === profile?.lookingFor,
      )
    : undefined;
  const [gender, setGender] = useState<TSelectOption | undefined>(
    genderDefault,
  );
  const [searchGender, setSearchGender] = useState<TSelectOption | undefined>(
    searchGenderDefault,
  );
  const [lookingFor, setLookingFor] = useState<TSelectOption | undefined>(
    lookingForDefault,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState({
    isGender: false,
    isSearchGender: false,
    isLookingFor: false,
  });
  const [valueInputDateField, setValueInputDateField] = useState<Date | null>(
    isEdit ? (profile?.birthday as Date | undefined) ?? null : null,
  );
  const [files, setFiles] = useState<TFile[] | null>(null);

  const { onAddFiles, onDeleteFile } = useFiles({
    fieldName: EFormFields.Image,
    files: files ?? [],
    setValue: (_fieldName: string, files: TFile[]) => setFiles(files),
  });

  // useEffect(() => {
  //   console.log("files: ", files);
  // }, [files]);
  useEffect(() => {
    console.log("state: ", state);
  }, [state]);
  useEffect(() => {
    console.log(" profile: ", profile);
  }, [profile]);

  useEffect(() => {
    if (isEdit && !isNil(profile)) {
      if (!isNil(state.data) && state.success && !state?.error) {
        const path = createPath({
          route: ERoutes.ProfileEdit,
          params: { id: profile.id },
        });
        redirect(path);
      }
    } else {
      if (!isNil(state.data) && state.success && !state?.error) {
        const path = createPath({
          route: ERoutes.Profile,
          params: { id: state.data.id },
        });
        redirect(path);
      }
    }
  }, [isEdit, profile, state]);

  const handleDeleteFile = (file: TFile, files: TFile[]) => {
    onDeleteFile?.(file, files);
  };

  const handleDateChange = (date: Date | null) => {
    setValueInputDateField?.(date);
  };

  const handleClickSave = () => {
    buttonSubmitRef.current && buttonSubmitRef.current.click();
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen({
      isGender: false,
      isSearchGender: false,
      isLookingFor: false,
    });
  };

  const handleChangeGender = (value?: TSelectOption) => {
    if (value) {
      value && setGender(value);
      handleCloseSidebar();
    }
  };

  const handleChangeSearchGender = (value?: TSelectOption) => {
    if (value) {
      value && setSearchGender(value);
      handleCloseSidebar();
    }
  };

  const handleChangeLookingFor = (value?: TSelectOption) => {
    if (value) {
      value && setLookingFor(value);
      handleCloseSidebar();
    }
  };

  const handleSubmit = (formData: FormData) => {
    const formDataDto = new FormData();
    const displayName = formData.get(EFormFields.DisplayName);
    const description = formData.get(EFormFields.Description);
    const location = formData.get(EFormFields.Location);
    const height = formData.get(EFormFields.Height);
    const weight = formData.get(EFormFields.Weight);
    formDataDto.append(EFormFields.DisplayName, (displayName ?? "").toString());
    formDataDto.append(EFormFields.Description, (description ?? "").toString());
    formDataDto.append(EFormFields.Location, (location ?? "").toString());
    formDataDto.append(EFormFields.Height, (height ?? "").toString());
    formDataDto.append(EFormFields.Weight, (weight ?? "").toString());
    (files ?? []).forEach((file) => {
      formDataDto.append(EFormFields.Image, file);
    });
    const utcDate = formattedDate(valueInputDateField);
    formDataDto.append(EFormFields.Birthday, utcDate ?? "");
    formDataDto.append(EFormFields.Gender, gender?.value.toString() ?? "");
    formDataDto.append(
      EFormFields.SearchGender,
      searchGender?.value.toString() ?? "",
    );
    formDataDto.append(
      EFormFields.LookingFor,
      lookingFor?.value.toString() ?? "",
    );
    formDataDto.append(EFormFields.TelegramID, user?.id.toString() ?? "1");
    formDataDto.append(EFormFields.QueryId, queryId ?? "1");
    formDataDto.append(EFormFields.FirstName, user?.first_name ?? "Евгений");
    formDataDto.append(EFormFields.LastName, user?.last_name ?? "Будаев");
    formDataDto.append(EFormFields.Username, user?.username ?? "budaev");
    formDataDto.append(EFormFields.LanguageCode, user?.language_code ?? "ru");
    formDataDto.append(
      EFormFields.AllowsWriteToPm,
      user?.allows_write_to_pm?.toString() ?? "true",
    );
    if (isEdit) {
      formDataDto.append("id", profile?.id.toString() ?? "");
      if (
        !isNil(profile?.images) &&
        !isEmpty(profile?.images) &&
        isEmpty(files)
      ) {
        formDataDto.append("isDefaultImage", "true");
      }
    }
    formAction(formDataDto);
  };

  return (
    <form action={handleSubmit} className="ProfileForm-Form">
      <Header>
        <div className="ProfileForm-Header-Cancel">
          {t("common.actions.cancel")}
        </div>
        <div className="ProfileForm-Header-Save" onClick={handleClickSave}>
          {t("common.actions.save")}
        </div>
      </Header>
      <Section isRequired={true} title={t("common.titles.publicPhotos")}>
        <Field>
          <FileUploader
            accept={{
              "image/avif": [".avif"],
              "image/jpeg": [".jpeg"],
              "image/jpg": [".jpg"],
              "image/png": [".png"],
              "image/webp": [".webp"],
            }}
            defaultImages={isEdit ? profile?.images ?? undefined : undefined}
            files={files ?? []}
            // isLoading={fetcherFilesLoading}
            // maxFiles={4}
            // maxSize={1280 * 1280}
            multiple={true}
            name={EFormFields.Image}
            onAddFiles={onAddFiles}
            onDeleteFile={handleDeleteFile}
            type="file"
          />
          {state?.errors?.image && (
            <Container>
              <div className="InputField-ErrorField">
                <Error errors={state?.errors?.image} />
              </div>
            </Container>
          )}
        </Field>
      </Section>
      <Section title={t("common.titles.moreDetails")}>
        <Field>
          <Input
            defaultValue={isEdit ? profile?.displayName : undefined}
            errors={state?.errors?.displayName}
            isRequired={true}
            label={t("common.form.field.name") ?? "First name"}
            name={EFormFields.DisplayName}
            type="text"
          />
        </Field>
        <Field>
          <span>
            {t("common.form.field.birthday")}
            <span className="ProfileForm-Required"> *</span>
          </span>
          <InputDateField
            errors={state?.errors?.birthday}
            locale={LANGUAGE_MAPPING[language]}
            onChange={handleDateChange}
            onFieldClear={() => setValueInputDateField(null)}
            placeholder={t("common.form.field.date.placeholder")}
            value={valueInputDateField}
          />
        </Field>
        <Field>
          <Textarea
            defaultValue={
              isEdit ? profile?.description ?? undefined : undefined
            }
            errors={state?.errors?.description}
            label={t("common.form.field.description") ?? "Description"}
            name={EFormFields.Description}
            type="text"
          />
        </Field>
      </Section>
      <Section title={t("common.titles.properties")}>
        <Field>
          <Select
            errors={state?.errors?.gender}
            isRequired={true}
            isSidebarOpen={isSidebarOpen.isGender}
            label={t("common.form.field.gender")}
            headerTitle={!isNil(gender) ? gender?.label : "--"}
            onHeaderClick={() =>
              setIsSidebarOpen((prev) => ({ ...prev, isGender: true }))
            }
            onSidebarClose={handleCloseSidebar}
          >
            <SidebarContent
              onSave={handleChangeGender}
              options={GENDER_MAPPING[language]}
              onCloseSidebar={handleCloseSidebar}
              selectedItem={gender}
              title={t("common.form.field.gender")}
            />
          </Select>
        </Field>
        <Field>
          <Select
            errors={state?.errors?.searchGender}
            isSidebarOpen={isSidebarOpen.isSearchGender}
            label={t("common.form.field.searchGender")}
            headerTitle={!isNil(searchGender) ? searchGender?.label : "--"}
            onHeaderClick={() =>
              setIsSidebarOpen((prev) => ({ ...prev, isSearchGender: true }))
            }
            onSidebarClose={handleCloseSidebar}
          >
            <SidebarContent
              onSave={handleChangeSearchGender}
              options={SEARCH_GENDER_MAPPING[language]}
              onCloseSidebar={handleCloseSidebar}
              selectedItem={searchGender}
              title={t("common.form.field.searchGender")}
            />
          </Select>
        </Field>
        <Field>
          <Input
            defaultValue={isEdit ? profile?.location : undefined}
            errors={state?.errors?.location}
            isRequired={true}
            label={t("common.form.field.location") ?? "Location"}
            name={EFormFields.Location}
            type="text"
          />
        </Field>
        <Field>
          <Input
            defaultValue={
              isEdit && profile?.height !== 0
                ? profile?.height ?? undefined
                : undefined
            }
            errors={state?.errors?.height}
            label={t("common.form.field.height") ?? "Height"}
            name={EFormFields.Height}
            type="text"
          />
        </Field>
        <Field>
          <Input
            defaultValue={
              isEdit && profile?.weight !== 0
                ? profile?.weight ?? undefined
                : undefined
            }
            errors={state?.errors?.weight}
            label={t("common.form.field.weight") ?? "Weight"}
            name={EFormFields.Weight}
            type="text"
          />
        </Field>
        <Field>
          <Select
            errors={state?.errors?.lookingFor}
            isSidebarOpen={isSidebarOpen.isLookingFor}
            label={t("common.form.field.lookingFor")}
            headerTitle={!isNil(lookingFor) ? lookingFor?.label : "--"}
            onHeaderClick={() =>
              setIsSidebarOpen((prev) => ({ ...prev, isLookingFor: true }))
            }
            onSidebarClose={handleCloseSidebar}
          >
            <SidebarContent
              onSave={handleChangeLookingFor}
              options={LOOKING_FOR_MAPPING[language]}
              onCloseSidebar={handleCloseSidebar}
              selectedItem={lookingFor}
              title={t("common.form.field.lookingFor")}
            />
          </Select>
        </Field>
      </Section>
      <input hidden={true} ref={buttonSubmitRef} type="submit" />
    </form>
  );
};
