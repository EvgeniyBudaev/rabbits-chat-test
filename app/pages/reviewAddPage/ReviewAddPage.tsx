"use client";

import isNil from "lodash/isNil";
import { redirect } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { addReviewAction } from "@/app/actions/review/add/addReviewAction";
import { useTranslation } from "@/app/i18n/client";
import { EFormFields } from "@/app/pages/reviewAddPage/enums";
import { Container } from "@/app/shared/components/container";
import { Field } from "@/app/shared/components/form/field";
import { Header } from "@/app/shared/components/header";
import { ERoutes } from "@/app/shared/enums";
import { createPath } from "@/app/shared/utils";
import { Rating } from "@/app/uikit/components/rating";
import { Textarea } from "@/app/uikit/components/textarea";
import "./ReviewAddPage.scss";

export const ReviewAddPage: FC = () => {
  const initialState = {
    data: undefined,
    error: undefined,
    errors: undefined,
    success: false,
  };
  const [state, formAction] = useFormState(addReviewAction, initialState);
  const { t } = useTranslation("index");
  const [rating, setRating] = useState(0);
  console.log("ReviewAddPage state: ", state);

  useEffect(() => {
    if (!isNil(state?.data) && state.success && !state?.error) {
      const path = createPath({
        route: ERoutes.Reviews,
      });
      redirect(path);
    }
  }, [state]);

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = (formData: FormData) => {
    const formDataDto = new FormData();
    const message = formData.get(EFormFields.Message);
    formDataDto.append(EFormFields.Rating, rating.toString());
    formDataDto.append(EFormFields.Message, message ?? "");
    formAction(formDataDto);
  };

  return (
    <div className="ReviewAddPage">
      <Container>
        <form action={handleSubmit} className="ReviewAddPage-Form">
          <Header className="SidebarContent-Header">
            <div />
            <div>{t("common.titles.reviewAdd")}</div>
            <div className="Header-Action">{t("common.actions.save")}</div>
          </Header>
          <div>
            <Field>
              <div>{t("common.form.field.rating")}</div>
              <Rating initialValue={rating} onChange={handleRating} />
            </Field>
            <Field>
              <Textarea
                classes={{ textarea: "ReviewAddPage-Textarea" }}
                isShowMaxLength={true}
                label={t("common.form.field.message") ?? "Message"}
                name={EFormFields.Message}
                maxLength={1000}
                type="text"
              />
            </Field>
          </div>
        </form>
      </Container>
    </div>
  );
};